export const PROJECT_ID = 1;
export const DEMO_VERIFICATION_DEADLINE = 1784246400;
export const DEMO_CONTRACT_ID = "CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J";

export const demoProject = {
  owner: "GDZN36SJ6LJURNUNBW47MQF3DZQDAOGSTZIQVABZLMOVJLN4HZZE5JFK",
  title: "Da Nang Solar Classroom",
  impact_unit: "kWh of verified solar energy",
  metadata_hash: "ipfs://solar-classroom-metadata-v2",
  report_hash: "ipfs://solar-meter-report-june-v2",
  payment_token: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  price_per_voucher: 1000000,
  unit_per_voucher: 10,
  verification_deadline: DEMO_VERIFICATION_DEADLINE,
  vouchers_sold: 2,
  funded_amount: 2000000,
  withdrawn_amount: 1000000,
  refunded_amount: 0,
  verified_units: 20,
  retired_units: 20,
};

export const demoHolding = {
  vouchers_owned: 2,
  active_vouchers: 0,
  retired_vouchers: 2,
  refunded_vouchers: 0,
  active_units: 0,
  retired_units: 20,
  refunded_units: 0,
  paid_amount: 2000000,
  refunded_amount: 0,
};

export const demoCampaigns = [
  {
    projectId: PROJECT_ID,
    title: "Da Nang Solar Classroom",
    merchant: "An Coffee Da Nang",
    location: "Da Nang, Vietnam",
    status: "Live on Testnet",
    category: "Solar education",
    checkoutSlug: "solar-classroom",
    checkoutChannel: "Cafe checkout pilot",
    contractBacked: true,
    network: "TESTNET",
    contractId: DEMO_CONTRACT_ID,
    paymentToken: demoProject.payment_token,
    pricePerVoucher: demoProject.price_per_voucher,
    unitPerVoucher: demoProject.unit_per_voucher,
    verificationDeadline: demoProject.verification_deadline,
    impactUnit: demoProject.impact_unit,
    vouchersSold: demoProject.vouchers_sold,
    fundedAmount: demoProject.funded_amount,
    verifiedUnits: demoProject.verified_units,
    withdrawnAmount: demoProject.withdrawn_amount,
    refundedAmount: demoProject.refunded_amount,
    refundStatus: "verified-no-refund",
    reportHash: demoProject.report_hash,
  },
  {
    projectId: 2,
    title: "Can Gio Mangrove Revival",
    merchant: "Weekend Market HCMC",
    location: "Ho Chi Minh City, Vietnam",
    status: "Preview campaign",
    category: "Mangrove restoration",
    checkoutSlug: "mangrove-revival",
    checkoutChannel: "Weekend market QR stand",
    contractBacked: false,
    network: "Product preview",
    contractId: null,
    paymentToken: demoProject.payment_token,
    pricePerVoucher: 1500000,
    unitPerVoucher: 3,
    verificationDeadline: 1781568000,
    impactUnit: "m2 of mangrove restoration",
    vouchersSold: 48,
    fundedAmount: 72000000,
    verifiedUnits: 0,
    withdrawnAmount: 0,
    refundedAmount: 0,
    refundStatus: "refund-window-open",
    reportHash: "Pending verifier report",
  },
  {
    projectId: 3,
    title: "Campus Refill Station",
    merchant: "Green Campus Club",
    location: "Hue, Vietnam",
    status: "Draft checkout",
    category: "Plastic reduction",
    checkoutSlug: "campus-refill",
    checkoutChannel: "Student event checkout",
    contractBacked: false,
    network: "Product preview",
    contractId: null,
    paymentToken: demoProject.payment_token,
    pricePerVoucher: 800000,
    unitPerVoucher: 12,
    verificationDeadline: 1784246400,
    impactUnit: "single-use bottles avoided",
    vouchersSold: 25,
    fundedAmount: 20000000,
    verifiedUnits: 120,
    withdrawnAmount: 0,
    refundedAmount: 0,
    refundStatus: "verified-no-refund",
    reportHash: "ipfs://campus-refill-audit-preview",
  },
];

export const demoReceipts = [
  {
    voucherId: "voucher-1",
    projectId: PROJECT_ID,
    buyer: "GDZN36...E5JFK",
    campaign: "Da Nang Solar Classroom",
    merchant: "An Coffee Da Nang",
    paidAmount: 1000000,
    impactAmount: 10,
    impactUnit: "kWh of verified solar energy",
    transactionHash: "ce18365fcaa1ab024be0f417175713c677afb98321209dce9c4d741e9f897a96",
    verificationStatus: "verified",
    refundStatus: "not_requested",
    reportHash: "ipfs://solar-meter-report-june-v2",
    issuedAt: "2026-06-17T00:00:00.000Z",
  },
];

export const demoIndexedTransactions = [
  {
    hash: "355f56f9f492a4e33ec90260ddf6347b8f6a25176b7618b72634344487d511ab",
    stage: "create_campaign",
    label: "Create campaign",
    projectId: 1,
    source: "seed-proof",
    status: "SUCCESS",
    syncedAt: "2026-06-17T00:00:00.000Z",
  },
  {
    hash: "ce18365fcaa1ab024be0f417175713c677afb98321209dce9c4d741e9f897a96",
    stage: "buy_voucher",
    label: "Buy voucher",
    projectId: 1,
    source: "seed-proof",
    status: "SUCCESS",
    syncedAt: "2026-06-17T00:00:00.000Z",
  },
  {
    hash: "6797048bcd49d9d96b05c3fbf5b2b4917edc4f29b9e11e006952ffcb8f77547d",
    stage: "verify_project",
    label: "Verify project",
    projectId: 1,
    source: "seed-proof",
    status: "SUCCESS",
    syncedAt: "2026-06-17T00:00:00.000Z",
  },
  {
    hash: "a4735c7a6f90cf21340dbe8c7b885c36308008f097f926bf0f768e9197b95f06",
    stage: "retire_voucher",
    label: "Retire voucher",
    projectId: 1,
    source: "seed-proof",
    status: "SUCCESS",
    syncedAt: "2026-06-17T00:00:00.000Z",
  },
  {
    hash: "c8062efdd8e0512f88bcf2908bef4f085d2b4d5175202f8d8b5b304c4b55e984",
    stage: "withdraw_funds",
    label: "Withdraw funds",
    projectId: 1,
    source: "seed-proof",
    status: "SUCCESS",
    syncedAt: "2026-06-17T00:00:00.000Z",
  },
  {
    hash: "ff2b42e1344fca911ce3c23656bc2035982ebdc07ec106f1fa32f6301989173a",
    stage: "create_campaign",
    label: "Create refund pilot",
    projectId: 2,
    source: "seed-proof",
    status: "SUCCESS",
    syncedAt: "2026-06-17T00:00:00.000Z",
  },
  {
    hash: "daa1342911d26c725ae08101c6e7dea396ed6a5191abdd086c0e42f463c6763e",
    stage: "buy_voucher",
    label: "Buy refund pilot voucher",
    projectId: 2,
    source: "seed-proof",
    status: "SUCCESS",
    syncedAt: "2026-06-17T00:00:00.000Z",
  },
  {
    hash: "7b44332277ce3be6b4d3167cf67f323b2956cb22593108ab4726b2537c28f9bf",
    stage: "refund_voucher",
    label: "Refund voucher",
    projectId: 2,
    source: "seed-proof",
    status: "SUCCESS",
    syncedAt: "2026-06-17T00:00:00.000Z",
  },
];

const stageMeaning = {
  create_campaign: "Campaign terms were created on the Soroban contract.",
  buy_voucher: "Customer payment entered the contract vault and minted a voucher claim.",
  verify_project: "Verifier recorded delivered impact units with a report hash.",
  retire_voucher: "Customer retired the voucher as receipt-grade impact proof.",
  withdraw_funds: "Project owner withdrew only the verified, available vault amount.",
  refund_voucher: "Customer refund was executed after an unverified campaign missed its deadline.",
};

function makeProof(projectId) {
  const campaign = demoCampaigns.find((item) => item.projectId === projectId) || demoCampaigns[0];
  const timeline = demoIndexedTransactions
    .filter((transaction) => transaction.projectId === campaign.projectId)
    .map((transaction) => ({
      ...transaction,
      meaning: stageMeaning[transaction.stage],
      stellarExpertUrl: `https://stellar.expert/explorer/testnet/tx/${transaction.hash}`,
    }));
  const contractId = campaign.contractId || (timeline.length > 0 ? DEMO_CONTRACT_ID : null);

  return {
    projectId: campaign.projectId,
    network: campaign.contractBacked || timeline.length > 0 ? "Stellar Testnet" : campaign.network,
    contractId,
    contractExplorerUrl: contractId ? `https://stellar.expert/explorer/testnet/contract/${contractId}` : null,
    campaign,
    receipts: demoReceipts.filter((receipt) => receipt.projectId === campaign.projectId),
    timeline,
    updatedAt: "2026-06-17T00:00:00.000Z",
  };
}

export const demoProofs = [makeProof(1), makeProof(2)];
