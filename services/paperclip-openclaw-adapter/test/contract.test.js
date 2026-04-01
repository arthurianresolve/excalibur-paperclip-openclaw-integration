import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const requiredEnv = {
  OPENCLAW_GATEWAY_URL: "https://gateway.example",
  OPENCLAW_AUTH_TOKEN: "token-abc",
  PAPERCLIP_CALLBACK_URL: "https://callback.example",
  TRUSTED_ACTIONS: "queryAuditLogs, runTrustedSkill",
};

describe("config parser", () => {
  let savedEnv;

  beforeEach(() => {
    vi.resetModules();
    savedEnv = {};
    for (const [key, value] of Object.entries(requiredEnv)) {
      savedEnv[key] = process.env[key];
      process.env[key] = value;
    }
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(requiredEnv)) {
      if (savedEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = savedEnv[key];
      }
    }
  });

  it("splits trusted actions with commas/spaces", async () => {
    const configModule = await import("../src/config.ts");
    const config = configModule.config ?? configModule.default?.config;
    expect(config).toBeDefined();
    expect(config.trustedActions).toEqual(["queryAuditLogs", "runTrustedSkill"]);
  });

  it("normalizes OpenClaw base URLs without trailing slashes", async () => {
    process.env.OPENCLAW_GATEWAY_URL = "https://gateway.example///";
    const configModule = await import("../src/config.ts");
    const config = configModule.config ?? configModule.default?.config;
    expect(config).toBeDefined();
    expect(config.openClaw.baseUrl).toBe("https://gateway.example");
  });
});
