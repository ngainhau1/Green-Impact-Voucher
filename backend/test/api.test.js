import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";
import { createRepository } from "../src/store/repository.js";

async function createTestApp() {
  const config = {
    port: 0,
    host: "127.0.0.1",
    nodeEnv: "test",
    logLevel: "silent",
    corsOrigins: ["http://127.0.0.1:5173"],
    frontendBaseUrl: "http://127.0.0.1:5173",
    storageFile: null,
    stellarRpcUrl: "https://soroban-testnet.stellar.org",
    stellarNetworkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J",
    paymentTokenId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  };
  const repository = await createRepository({ storageFile: null });
  return buildApp({ config, repository });
}

test("health and readiness endpoints respond", async () => {
  const app = await createTestApp();
  const health = await app.inject({ method: "GET", url: "/health" });
  assert.equal(health.statusCode, 200);
  assert.equal(health.json().status, "ok");

  const ready = await app.inject({ method: "GET", url: "/ready" });
  assert.equal(ready.statusCode, 200);
  assert.equal(ready.json().checks.campaigns, 3);
  await app.close();
});

test("campaign endpoints expose seeded product campaigns", async () => {
  const app = await createTestApp();
  const response = await app.inject({ method: "GET", url: "/api/campaigns" });
  assert.equal(response.statusCode, 200);
  const campaigns = response.json().data;
  assert.equal(campaigns.length, 3);
  assert.equal(campaigns[0].contractBacked, true);
  assert.equal(campaigns[0].verificationDeadline, 1784246400);
  assert.equal(campaigns[1].refundStatus, "refund-window-open");

  const detail = await app.inject({ method: "GET", url: "/api/campaigns/1" });
  assert.equal(detail.statusCode, 200);
  assert.equal(detail.json().data.title, "Da Nang Solar Classroom");
  await app.close();
});

test("checkout sessions are created and resolved", async () => {
  const app = await createTestApp();
  const created = await app.inject({
    method: "POST",
    url: "/api/checkout-sessions",
    payload: { projectId: 1, quantity: 2, buyerAddress: "GBUYER1234567890" },
  });
  assert.equal(created.statusCode, 201);
  const session = created.json().data;
  assert.equal(session.projectId, 1);
  assert.equal(session.quantity, 2);
  assert.match(session.checkoutUrl, /#\/checkout\/1\?session=/);

  const fetched = await app.inject({ method: "GET", url: `/api/checkout-sessions/${session.id}` });
  assert.equal(fetched.statusCode, 200);
  assert.equal(fetched.json().data.id, session.id);
  await app.close();
});

test("merchant dashboard returns aggregate finance metrics", async () => {
  const app = await createTestApp();
  const response = await app.inject({ method: "GET", url: "/api/merchant/dashboard" });
  assert.equal(response.statusCode, 200);
  const dashboard = response.json().data;
  assert.equal(dashboard.totals.campaigns, 3);
  assert.equal(dashboard.totals.vouchersSold, 75);
  assert.equal(dashboard.totals.refundRiskAmount, 72000000);
  assert.equal(dashboard.indexedTransactionCount, 8);
  await app.close();
});

test("receipts and indexer seed sync are available", async () => {
  const app = await createTestApp();
  const receipt = await app.inject({ method: "GET", url: "/api/receipts/voucher-1" });
  assert.equal(receipt.statusCode, 200);
  assert.equal(receipt.json().data.verificationStatus, "verified");

  const sync = await app.inject({
    method: "POST",
    url: "/api/indexer/sync",
    payload: { mode: "seed" },
  });
  assert.equal(sync.statusCode, 200);
  assert.equal(sync.json().data.length, 8);
  await app.close();
});

test("proof endpoint returns verified campaign timeline", async () => {
  const app = await createTestApp();
  const response = await app.inject({ method: "GET", url: "/api/proof/1" });
  assert.equal(response.statusCode, 200);
  const proof = response.json().data;
  assert.equal(proof.projectId, 1);
  assert.equal(proof.network, "Stellar Testnet");
  assert.equal(proof.receipts.length, 1);
  assert.deepEqual(
    proof.timeline.map((item) => item.stage),
    ["create_campaign", "buy_voucher", "verify_project", "retire_voucher", "withdraw_funds"],
  );
  assert.match(proof.contractExplorerUrl, /stellar\.expert\/explorer\/testnet\/contract/);
  assert.match(proof.timeline[0].stellarExpertUrl, /stellar\.expert\/explorer\/testnet\/tx/);
  await app.close();
});

test("proof endpoint returns refund campaign timeline", async () => {
  const app = await createTestApp();
  const response = await app.inject({ method: "GET", url: "/api/proof/2" });
  assert.equal(response.statusCode, 200);
  const proof = response.json().data;
  assert.equal(proof.projectId, 2);
  assert.equal(proof.campaign.refundStatus, "refund-window-open");
  assert.deepEqual(
    proof.timeline.map((item) => item.stage),
    ["create_campaign", "buy_voucher", "refund_voucher"],
  );
  assert.equal(proof.timeline.at(-1).label, "Refund voucher");
  await app.close();
});

test("proof endpoint returns structured not found error", async () => {
  const app = await createTestApp();
  const response = await app.inject({ method: "GET", url: "/api/proof/999" });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().error.code, "NOT_FOUND");
  await app.close();
});
