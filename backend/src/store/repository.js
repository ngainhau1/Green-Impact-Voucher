import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { seedState } from "../seed.js";
import { NotFoundError } from "../errors.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

async function loadState(storageFile) {
  if (!storageFile) return clone(seedState);
  try {
    const raw = await readFile(storageFile, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return clone(seedState);
  }
}

export async function createRepository({ storageFile } = {}) {
  const state = await loadState(storageFile);

  async function persist() {
    if (!storageFile) return;
    await mkdir(dirname(storageFile), { recursive: true });
    await writeFile(storageFile, `${JSON.stringify(state, null, 2)}\n`);
  }

  return {
    async health() {
      return {
        storage: storageFile ? "json-file" : "memory",
        campaigns: state.campaigns.length,
        checkoutSessions: state.checkoutSessions.length,
        receipts: state.receipts.length,
      };
    },

    async listCampaigns() {
      return clone(state.campaigns);
    },

    async getCampaign(projectId) {
      const campaign = state.campaigns.find((item) => item.projectId === Number(projectId));
      if (!campaign) throw new NotFoundError("Campaign", String(projectId));
      return clone(campaign);
    },

    async createCheckoutSession(input, config) {
      const campaign = await this.getCampaign(input.projectId);
      const session = {
        id: `cs_${randomUUID().replaceAll("-", "").slice(0, 20)}`,
        projectId: campaign.projectId,
        campaignTitle: campaign.title,
        merchant: campaign.merchant,
        quantity: input.quantity,
        buyerAddress: input.buyerAddress || null,
        status: "open",
        contractBacked: campaign.contractBacked,
        amount: campaign.pricePerVoucher * input.quantity,
        impactAmount: campaign.unitPerVoucher * input.quantity,
        impactUnit: campaign.impactUnit,
        checkoutUrl: `${config.frontendBaseUrl}/#/checkout/${campaign.projectId}?session=`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        createdAt: nowIso(),
      };
      session.checkoutUrl += encodeURIComponent(session.id);
      state.checkoutSessions.unshift(session);
      await persist();
      return clone(session);
    },

    async getCheckoutSession(sessionId) {
      const session = state.checkoutSessions.find((item) => item.id === sessionId);
      if (!session) throw new NotFoundError("Checkout session", sessionId);
      return clone(session);
    },

    async listReceipts() {
      return clone(state.receipts);
    },

    async getReceipt(voucherId) {
      const receipt = state.receipts.find((item) => item.voucherId === voucherId);
      if (!receipt) throw new NotFoundError("Receipt", voucherId);
      return clone(receipt);
    },

    async listIndexedTransactions() {
      return clone(state.indexedTransactions);
    },

    async upsertIndexedTransactions(records) {
      for (const record of records) {
        const index = state.indexedTransactions.findIndex((item) => item.hash === record.hash);
        if (index >= 0) {
          state.indexedTransactions[index] = { ...state.indexedTransactions[index], ...record };
        } else {
          state.indexedTransactions.unshift(record);
        }
      }
      await persist();
      return clone(records);
    },
  };
}
