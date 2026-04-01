import { describe, expect, it } from "vitest";
import { redactAuth } from "../src/lib/redact.ts";

describe("redactAuth", () => {
  it("masks most characters without removing start/end", () => {
    expect(redactAuth("Bearer supersecret")).toBe("***secret");
  });

  it("handles empty headers gracefully", () => {
    expect(redactAuth("")).toBe("");
    expect(redactAuth(undefined)).toBe("");
  });
});
