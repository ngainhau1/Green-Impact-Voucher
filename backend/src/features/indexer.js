import { z } from "zod";
import { parseWithSchema, UpstreamError } from "../errors.js";

const syncSchema = z.object({
  mode: z.enum(["seed", "rpc"]).default("seed"),
  txHashes: z.array(z.string().trim().min(20)).optional(),
});

async function fetchRpcTransaction(config, hash) {
  const response = await fetch(config.stellarRpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `tx-${hash.slice(0, 10)}`,
      method: "getTransaction",
      params: { hash },
    }),
  });

  if (!response.ok) {
    throw new UpstreamError("Soroban RPC request failed.", { status: response.status });
  }

  const body = await response.json();
  if (body.error) {
    throw new UpstreamError("Soroban RPC returned an error.", body.error);
  }

  return {
    hash,
    label: "RPC transaction",
    projectId: 1,
    source: "soroban-rpc",
    status: body.result?.status || "UNKNOWN",
    ledger: body.result?.ledger || null,
    syncedAt: new Date().toISOString(),
  };
}

export async function registerIndexerRoutes(app, { repository, config }) {
  app.get("/api/indexer/transactions", async () => {
    const transactions = await repository.listIndexedTransactions();
    return { data: transactions };
  });

  app.post("/api/indexer/sync", async (request) => {
    const input = parseWithSchema(syncSchema, request.body || {});

    if (input.mode === "seed") {
      const transactions = await repository.listIndexedTransactions();
      const records = transactions.map((transaction) => ({
        ...transaction,
        source: transaction.source || "seed-proof",
        syncedAt: new Date().toISOString(),
      }));
      await repository.upsertIndexedTransactions(records);
      return { data: records };
    }

    if (!input.txHashes?.length) {
      throw new UpstreamError("RPC sync requires txHashes.", { field: "txHashes" });
    }

    const records = await Promise.all(input.txHashes.map((hash) => fetchRpcTransaction(config, hash)));
    await repository.upsertIndexedTransactions(records);
    return { data: records };
  });
}
