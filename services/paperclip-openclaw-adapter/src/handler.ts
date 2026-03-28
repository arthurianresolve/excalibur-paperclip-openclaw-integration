import { z } from "zod";
import { callOpenClaw } from "./clients";
import { config } from "./config";
import { isStableId } from "./lib/ids";

const ACTION_NAMES = ["queryAuditLogs", "runTrustedSkill"] as const;
export type ActionName = (typeof ACTION_NAMES)[number];
export const ACTION_LIST = ACTION_NAMES;

const actionSchemas = {
  queryAuditLogs: z.object({
    filters: z.record(z.any()).optional(),
  }),
  runTrustedSkill: z.object({
    skillId: z.string().min(1),
    inputs: z.record(z.any()).optional(),
  }),
};

type HandlerResult =
  | { status: "ok"; data: unknown }
  | { status: "error"; error: string };

interface ActionMetadata<TSchema extends z.ZodTypeAny> {
  schema: TSchema;
  isMutating: boolean;
  handler: (payload: z.infer<TSchema>) => Promise<unknown>;
}

const metadata: Record<ActionName, ActionMetadata<z.ZodTypeAny>> = {
  queryAuditLogs: {
    schema: actionSchemas.queryAuditLogs,
    isMutating: false,
    async handler(payload) {
      return callOpenClaw({
        path: "/adapter/query/audit-logs",
        method: "post",
        data: payload,
      });
    },
  },
  runTrustedSkill: {
    schema: actionSchemas.runTrustedSkill,
    isMutating: true,
    async handler(payload) {
      if (!isStableId(payload.skillId)) {
        throw new Error("skillId must be alphanumeric");
      }
      return callOpenClaw({
        path: "/adapter/run-trusted-skill",
        method: "post",
        data: payload,
      });
    },
  },
};

export async function handleAction(
  action: ActionName,
  payload: unknown,
): Promise<HandlerResult> {
  if (!config.trustedActions.includes(action)) {
    return {
      status: "error",
      error: "action not trusted in this configuration",
    };
  }

  const meta = metadata[action];
  try {
    const parsed = meta.schema.parse(payload);
    const data = await meta.handler(parsed);
    return { status: "ok", data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "error", error: error.message };
    }
    return {
      status: "error",
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}
