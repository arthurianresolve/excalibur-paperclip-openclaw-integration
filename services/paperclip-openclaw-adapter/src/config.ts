import { z } from "zod";

const envSchema = z.object({
  PORT: z
    .preprocess(
      (value) => parseInt(z.string().parse(value), 10),
      z.number().int().positive(),
    )
    .optional()
    .default(3000),
  OPENCLAW_GATEWAY_URL: z.string().url(),
  OPENCLAW_ACTION_PATH: z.string().default("/gateway/actions"),
  OPENCLAW_AUTH_TOKEN: z.string().min(1),
  PAPERCLIP_CALLBACK_URL: z.string().url(),
  TRUSTED_ACTIONS: z.string().default("queryAuditLogs,runTrustedSkill"),
});

const parsed = envSchema.parse(process.env);

export const config = {
  port: parsed.PORT,
  openClaw: {
    baseUrl: parsed.OPENCLAW_GATEWAY_URL.replace(/\/+$/, ""),
    actionPath: parsed.OPENCLAW_ACTION_PATH,
    token: parsed.OPENCLAW_AUTH_TOKEN,
  },
  paperclipCallbackUrl: parsed.PAPERCLIP_CALLBACK_URL,
  trustedActions: parsed.TRUSTED_ACTIONS.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean),
};
