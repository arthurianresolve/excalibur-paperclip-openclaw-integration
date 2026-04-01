import { beforeEach, describe, expect, it, vi } from "vitest";

function createConfigMock() {
  return {
    __esModule: true,
    config: {
      openClaw: {
        baseUrl: "https://gateway.example",
        actionPath: "/gateway/actions",
        token: "token-123",
      },
      trustedActions: ["queryAuditLogs"],
      paperclipCallbackUrl: "https://paperclip.example/callback",
      port: 3000,
    },
  };
}

vi.mock("../src/config.ts", createConfigMock);
vi.mock("../src/config.js", createConfigMock);
function createRedactMock() {
  return {
    __esModule: true,
    redactAuth: (value) => (typeof value === "string" ? value : String(value ?? "")),
  };
}
vi.mock("../src/lib/redact.ts", createRedactMock);
vi.mock("../src/lib/redact.js", createRedactMock);
vi.mock("axios", () => {
  const axiosMock = vi.fn();
  axiosMock.isAxiosError = (error) => Boolean(error && typeof error === "object" && "isAxiosError" in error);
  return {
    __esModule: true,
    default: axiosMock,
    isAxiosError: axiosMock.isAxiosError,
  };
});

import { callOpenClaw } from "../src/clients.ts";
import axios from "axios";

const mockAxios = axios;

describe("callOpenClaw", () => {
  beforeEach(() => {
    mockAxios.mockReset();
  });

  it("returns response data and sends the configured headers", async () => {
    mockAxios.mockResolvedValueOnce({ data: { success: true } });
    await expect(callOpenClaw({ path: "/foo", data: { bar: "baz" } })).resolves.toEqual({ success: true });

    const requestConfig = mockAxios.mock.calls[0][0];
    expect(requestConfig.url).toBe("https://gateway.example/gateway/actions/foo");
    expect(requestConfig.method).toBe("post");
    expect(requestConfig.headers.Authorization).toBe("Bearer token-123");
  });

  it("redacts auth when axios throws an axios error", async () => {
    const axiosError = new Error("boom");
    axiosError.isAxiosError = true;
    mockAxios.mockRejectedValueOnce(axiosError);

    await expect(callOpenClaw({ path: "/foo" })).rejects.toThrow(/token=/);
  });
});
