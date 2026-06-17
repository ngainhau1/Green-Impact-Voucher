export async function registerMerchantRoutes(app, { repository }) {
  app.get("/api/merchant/dashboard", async () => {
    const [campaigns, sessions, receipts, indexedTransactions] = await Promise.all([
      repository.listCampaigns(),
      repository.health().then((health) => health.checkoutSessions),
      repository.listReceipts(),
      repository.listIndexedTransactions(),
    ]);

    const totals = campaigns.reduce(
      (acc, campaign) => {
        acc.campaigns += 1;
        acc.activeCampaigns += campaign.contractBacked || campaign.status.toLowerCase().includes("live") ? 1 : 0;
        acc.vouchersSold += campaign.vouchersSold;
        acc.escrowBalance += Math.max(campaign.fundedAmount - campaign.withdrawnAmount - campaign.refundedAmount, 0);
        acc.verifiedUnits += campaign.verifiedUnits;
        acc.payoutReadyAmount += campaign.payoutReadyAmount;
        acc.refundRiskAmount += campaign.verifiedUnits > 0 ? 0 : campaign.fundedAmount;
        return acc;
      },
      {
        campaigns: 0,
        activeCampaigns: 0,
        vouchersSold: 0,
        escrowBalance: 0,
        verifiedUnits: 0,
        payoutReadyAmount: 0,
        refundRiskAmount: 0,
      },
    );

    return {
      data: {
        totals,
        checkoutSessions: sessions,
        receiptCount: receipts.length,
        indexedTransactionCount: indexedTransactions.length,
        updatedAt: new Date().toISOString(),
      },
    };
  });
}
