import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = await buildApp({ config });

const close = async (signal) => {
  app.log.info({ signal }, "Shutting down backend");
  await app.close();
  process.exit(0);
};

process.on("SIGINT", () => close("SIGINT"));
process.on("SIGTERM", () => close("SIGTERM"));

try {
  await app.listen({ port: config.port, host: config.host });
} catch (error) {
  app.log.error({ err: error }, "Backend failed to start");
  process.exit(1);
}
