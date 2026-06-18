import { z } from "zod";
import { parseWithSchema } from "../errors.js";

const proofParamsSchema = z.object({
  projectId: z.coerce.number().int().positive(),
});

const stageOrder = [
  "create_campaign",
  "buy_voucher",
  "verify_project",
  "retire_voucher",
  "withdraw_funds",
  "refund_voucher",
];

const stageMeaning = {
  create_campaign: "Campaign terms were created on the Soroban contract.",
  buy_voucher: "Customer payment entered the contract vault and minted a voucher claim.",
  verify_project: "Verifier recorded delivered impact units with a report hash.",
  retire_voucher: "Customer retired the voucher as receipt-grade impact proof.",
  withdraw_funds: "Project owner withdrew only the verified, available vault amount.",
  refund_voucher: "Customer refund was executed after an unverified campaign missed its deadline.",
};

function stellarExpertContract(contractId) {
  return `https://stellar.expert/explorer/testnet/contract/${contractId}`;
}

function stellarExpertTx(hash) {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

function toNetworkName(campaign, timeline) {
  if (campaign.network === "TESTNET" || timeline.length > 0) return "Stellar Testnet";
  return campaign.network || "Product preview";
}

function buildTimeline(transactions, projectId) {
  return transactions
    .filter((transaction) => Number(transaction.projectId) === Number(projectId))
    .sort((left, right) => {
      const leftOrder = stageOrder.indexOf(left.stage);
      const rightOrder = stageOrder.indexOf(right.stage);
      return (leftOrder === -1 ? 999 : leftOrder) - (rightOrder === -1 ? 999 : rightOrder);
    })
    .map((transaction) => ({
      ...transaction,
      meaning: stageMeaning[transaction.stage] || "Indexed transaction proof for this campaign.",
      stellarExpertUrl: stellarExpertTx(transaction.hash),
    }));
}

export async function registerProofRoutes(app, { repository, config }) {
  app.get("/api/proof/:projectId", async (request) => {
    const { projectId } = parseWithSchema(proofParamsSchema, request.params);
    const [campaign, receipts, indexedTransactions] = await Promise.all([
      repository.getCampaign(projectId),
      repository.listReceipts(),
      repository.listIndexedTransactions(),
    ]);
    const contractId = campaign.contractId || config.contractId;
    const timeline = buildTimeline(indexedTransactions, projectId);

    return {
      data: {
        projectId,
        network: toNetworkName(campaign, timeline),
        contractId,
        contractExplorerUrl: contractId ? stellarExpertContract(contractId) : null,
        campaign,
        receipts: receipts.filter((receipt) => Number(receipt.projectId) === projectId),
        timeline,
        updatedAt: new Date().toISOString(),
      },
    };
  });
}
