import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { randomUUID } from "node:crypto";
import { loadConfig } from "./config.js";
import { AppError } from "./errors.js";
import { createRepository } from "./store/repository.js";
import { registerCampaignRoutes } from "./features/campaigns.js";
import { registerCheckoutSessionRoutes } from "./features/checkoutSessions.js";
import { registerReceiptRoutes } from "./features/receipts.js";
import { registerProofRoutes } from "./features/proof.js";
import { registerMerchantRoutes } from "./features/merchant.js";
import { registerIndexerRoutes } from "./features/indexer.js";

function isAllowedOrigin(origin, allowedOrigins) {
  return !origin || allowedOrigins.includes(origin);
}

export async function buildApp(options = {}) {
  const config = options.config || loadConfig();
  const repository = options.repository || (await createRepository({ storageFile: config.storageFile }));
  const app = Fastify({
    logger: config.nodeEnv === "test" ? false : { level: config.logLevel },
    genReqId: () => randomUUID(),
  });

  await app.register(cors, {
    origin(origin, callback) {
      if (isAllowedOrigin(origin, config.corsOrigins)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS."), false);
    },
  });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: 180,
    timeWindow: "1 minute",
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "green-impact-voucher-backend",
    timestamp: new Date().toISOString(),
  }));

  app.get("/ready", async () => ({
    status: "ok",
    checks: await repository.health(),
  }));

  await registerCampaignRoutes(app, { repository, config });
  await registerCheckoutSessionRoutes(app, { repository, config });
  await registerReceiptRoutes(app, { repository, config });
  await registerProofRoutes(app, { repository, config });
  await registerMerchantRoutes(app, { repository, config });
  await registerIndexerRoutes(app, { repository, config });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError && error.isOperational) {
      request.log.warn({ error: error.code, details: error.details }, error.message);
      reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId: request.id,
        },
      });
      return;
    }

    request.log.error({ err: error }, "Unhandled backend error");
    reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        requestId: request.id,
      },
    });
  });

  return app;
}
