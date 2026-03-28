import { config } from "../config";

export function readiness(): { status: "ready" } {
  if (!config.openClaw.baseUrl || !config.openClaw.token) {
    throw new Error("OpenClaw gateway configuration incomplete");
  }

  return { status: "ready" };
}

export function liveness(): { status: "ok" } {
  return { status: "ok" };
}
