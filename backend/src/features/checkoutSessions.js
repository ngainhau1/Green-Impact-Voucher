import { z } from "zod";
import { parseWithSchema } from "../errors.js";

const createSessionSchema = z.object({
  projectId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().max(100).default(1),
  buyerAddress: z.string().trim().min(8).max(80).optional(),
});

const sessionParamsSchema = z.object({
  sessionId: z.string().trim().min(4),
});

export async function registerCheckoutSessionRoutes(app, { repository, config }) {
  app.post("/api/checkout-sessions", async (request, reply) => {
    const input = parseWithSchema(createSessionSchema, request.body || {});
    const session = await repository.createCheckoutSession(input, config);
    reply.code(201);
    return { data: session };
  });

  app.get("/api/checkout-sessions/:sessionId", async (request) => {
    const { sessionId } = parseWithSchema(sessionParamsSchema, request.params);
    const session = await repository.getCheckoutSession(sessionId);
    return { data: session };
  });
}
