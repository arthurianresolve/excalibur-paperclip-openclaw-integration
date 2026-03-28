import express from "express";
import { z } from "zod";
import { handleAction, ACTION_LIST, ActionName } from "./handler";
import { liveness, readiness } from "./lib/health";

const actionRequestSchema = z.object({
  action: z.enum(ACTION_LIST),
  payload: z.record(z.any()).optional(),
});

type ActionRequest = z.infer<typeof actionRequestSchema>;

export function createTransport() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ liveness: liveness(), readiness: readiness() });
  });

  app.post("/actions", async (req, res) => {
    try {
      const { action, payload }: ActionRequest = actionRequestSchema.parse(
        req.body,
      );
      const result = await handleAction(action as ActionName, payload);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ status: "error", error: error.message });
        return;
      }
      res.status(500).json({
        status: "error",
        error: error instanceof Error ? error.message : "unexpected",
      });
    }
  });

  return app;
}
