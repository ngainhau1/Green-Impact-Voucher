import { z } from "zod";
import { parseWithSchema } from "../errors.js";

const receiptParamsSchema = z.object({
  voucherId: z.string().trim().min(1),
});

export async function registerReceiptRoutes(app, { repository }) {
  app.get("/api/receipts/:voucherId", async (request) => {
    const { voucherId } = parseWithSchema(receiptParamsSchema, request.params);
    const receipt = await repository.getReceipt(voucherId);
    return { data: receipt };
  });
}
