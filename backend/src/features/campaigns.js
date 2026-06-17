import { z } from "zod";
import { parseWithSchema } from "../errors.js";

const projectParamsSchema = z.object({
  projectId: z.coerce.number().int().positive(),
});

export async function registerCampaignRoutes(app, { repository }) {
  app.get("/api/campaigns", async () => {
    const campaigns = await repository.listCampaigns();
    return { data: campaigns };
  });

  app.get("/api/campaigns/:projectId", async (request) => {
    const { projectId } = parseWithSchema(projectParamsSchema, request.params);
    const campaign = await repository.getCampaign(projectId);
    return { data: campaign };
  });
}
