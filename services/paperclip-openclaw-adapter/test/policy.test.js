import { describe, it, expect } from "vitest";
import { isStableId } from "../src/lib/ids.ts";

describe("stable id helper", () => {
  it("allows alphanumeric and hyphen characters", () => {
    expect(isStableId("skill-123")).toBe(true);
    expect(isStableId("abcDEF789")).toBe(true);
  });

  it("rejects spaces and punctuation", () => {
    expect(isStableId("bad id")).toBe(false);
    expect(isStableId("!invalid!")).toBe(false);
  });
});
