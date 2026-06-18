import { resolve } from "node:path";

function parsePort(value) {
  const port = Number(value || 8787);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  return port;
}

function parseOrigins(value) {
  return String(value || "http://127.0.0.1:5173,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function loadConfig(env = process.env) {
  const storageFile = env.BACKEND_STORAGE_FILE || ".data/green-impact-voucher.local.json";
  return {
    port: parsePort(env.PORT),
    host: env.HOST || "127.0.0.1",
    nodeEnv: env.NODE_ENV || "development",
    logLevel: env.LOG_LEVEL || "info",
    corsOrigins: parseOrigins(env.CORS_ORIGINS),
    frontendBaseUrl: env.FRONTEND_BASE_URL || "http://127.0.0.1:5173",
    storageFile: storageFile === "memory" ? null : resolve(storageFile),
    stellarRpcUrl: env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org",
    stellarNetworkPassphrase: env.STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
    contractId: env.CONTRACT_ID || "CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J",
    paymentTokenId:
      env.PAYMENT_TOKEN_ID || "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  };
}
