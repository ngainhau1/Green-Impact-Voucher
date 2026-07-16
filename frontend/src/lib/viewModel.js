import {
  demoCampaigns,
  demoHolding,
  demoProject,
  demoProofs,
  demoReceipts,
  PROJECT_ID,
} from "./demoData";

export const DEFAULT_DEADLINE_SECONDS = 30 * 24 * 60 * 60;

export const flowTabs = [
  {
    id: "customer",
    label: "Customer Checkout",
    title: "Cafe checkout pilot",
    metric: "0.10 XLM voucher",
    detail: "A shopper adds verified solar impact during payment.",
  },
  {
    id: "merchant",
    label: "Merchant Console",
    title: "Campaign finance view",
    metric: "Escrowed payout",
    detail: "The merchant tracks campaigns, checkout links, vault balances, and public proof.",
  },
  {
    id: "verifier",
    label: "Verifier Vault",
    title: "Report-gated release",
    metric: "Proof before payout",
    detail: "Funds unlock only after verified impact units are recorded.",
  },
];

export const financeFlow = [
  { label: "Checkout", detail: "Customer scans QR or opens a checkout link" },
  { label: "Vault", detail: "Funds move into Soroban escrow" },
  { label: "Verification", detail: "Impact report unlocks payout" },
  { label: "Receipt", detail: "Customer receives public proof" },
];

export const journeySteps = [
  {
    title: "Cafe checkout",
    label: "QR payment moment",
    detail: "A customer adds a small green voucher during a normal merchant checkout.",
  },
  {
    title: "Escrow vault",
    label: "Funds held first",
    detail: "Payment moves into the Soroban contract vault instead of direct unverified payout.",
  },
  {
    title: "Satellite proof",
    label: "Report hash evidence",
    detail: "Verifier evidence ties the campaign to a public report hash and delivered units.",
  },
  {
    title: "Public receipt",
    label: "Customer proof",
    detail: "The buyer can share receipt-grade proof with Stellar Expert transaction links.",
  },
];

export function defaultVerificationDeadline() {
  return Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_SECONDS;
}

export function asNumber(value) {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string" && value !== "") return Number(value);
  return 0;
}

export function normalizeProject(project) {
  return {
    ...demoProject,
    ...project,
    price_per_voucher: asNumber(project?.price_per_voucher ?? demoProject.price_per_voucher),
    unit_per_voucher: asNumber(project?.unit_per_voucher ?? demoProject.unit_per_voucher),
    verification_deadline: asNumber(project?.verification_deadline ?? demoProject.verification_deadline),
    vouchers_sold: asNumber(project?.vouchers_sold ?? demoProject.vouchers_sold),
    funded_amount: asNumber(project?.funded_amount ?? demoProject.funded_amount),
    withdrawn_amount: asNumber(project?.withdrawn_amount ?? demoProject.withdrawn_amount),
    refunded_amount: asNumber(project?.refunded_amount ?? demoProject.refunded_amount),
    verified_units: asNumber(project?.verified_units ?? demoProject.verified_units),
    retired_units: asNumber(project?.retired_units ?? demoProject.retired_units),
  };
}

export function normalizeHolding(holding) {
  return {
    ...demoHolding,
    ...holding,
    vouchers_owned: asNumber(holding?.vouchers_owned ?? 0),
    active_vouchers: asNumber(holding?.active_vouchers ?? 0),
    retired_vouchers: asNumber(holding?.retired_vouchers ?? 0),
    refunded_vouchers: asNumber(holding?.refunded_vouchers ?? 0),
    active_units: asNumber(holding?.active_units ?? 0),
    retired_units: asNumber(holding?.retired_units ?? 0),
    refunded_units: asNumber(holding?.refunded_units ?? 0),
    paid_amount: asNumber(holding?.paid_amount ?? 0),
    refunded_amount: asNumber(holding?.refunded_amount ?? 0),
  };
}

export function getContractCampaign(campaigns = demoCampaigns) {
  return campaigns.find((campaign) => campaign.contractBacked) || campaigns[0] || demoCampaigns[0];
}

export function getCampaignByProjectId(projectId, campaigns = demoCampaigns) {
  return campaigns.find((campaign) => campaign.projectId === Number(projectId)) || getContractCampaign(campaigns);
}

export function getCheckoutRouteFromHash() {
  if (typeof window === "undefined") return { projectId: PROJECT_ID, sessionId: "" };
  const match = window.location.hash.match(/^#\/checkout\/(\d+)(?:\?session=([^&]+))?/);
  return {
    projectId: match ? Number(match[1]) : PROJECT_ID,
    sessionId: match?.[2] ? decodeURIComponent(match[2]) : "",
  };
}

export function getPublicRouteFromHash() {
  if (typeof window === "undefined") return { type: "app" };
  const hash = window.location.hash;
  const receiptMatch = hash.match(/^#\/receipt\/([^?&]+)/);
  if (receiptMatch) return { type: "receipt", voucherId: decodeURIComponent(receiptMatch[1]) };
  const proofMatch = hash.match(/^#\/proof\/(\d+)/);
  if (proofMatch) return { type: "proof", projectId: Number(proofMatch[1]) };
  if (hash.startsWith("#/checkout/")) return { type: "checkout", ...getCheckoutRouteFromHash() };
  return { type: "app" };
}

export function getCheckoutProjectIdFromHash() {
  return getCheckoutRouteFromHash().projectId;
}

export function makeHashLink(hash) {
  if (typeof window === "undefined") return hash;
  return `${window.location.origin}${window.location.pathname}${hash}`;
}

export function makeCheckoutLink(projectId) {
  return makeHashLink(`#/checkout/${projectId}`);
}

export function makeReceiptLink(voucherId) {
  return makeHashLink(`#/receipt/${encodeURIComponent(voucherId)}`);
}

export function makeProofLink(projectId) {
  return makeHashLink(`#/proof/${projectId}`);
}

export function openHashRoute(hash) {
  if (typeof window !== "undefined") window.location.hash = hash.replace(/^#/, "");
}

export function formatDeadline(seconds) {
  const value = Number(seconds || 0);
  if (!value) return "No deadline";
  return new Date(value * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isRefundWindowOpen(project) {
  return (
    Number(project?.verified_units || 0) === 0 &&
    Number(project?.verification_deadline || 0) > 0 &&
    Math.floor(Date.now() / 1000) > Number(project.verification_deadline)
  );
}

export function getRefundPolicyLabel(project, campaign) {
  if (!campaign.contractBacked) return "Preview only";
  if (Number(project.verified_units || 0) > 0) return "Verification complete";
  if (isRefundWindowOpen(project)) return "Refund window open";
  return `Protected until ${formatDeadline(project.verification_deadline)}`;
}

export function campaignToProject(campaign, liveProject) {
  if (campaign.contractBacked) return liveProject;
  return normalizeProject({
    ...liveProject,
    title: campaign.title,
    impact_unit: campaign.impactUnit,
    report_hash: campaign.reportHash,
    price_per_voucher: campaign.pricePerVoucher,
    unit_per_voucher: campaign.unitPerVoucher,
    verification_deadline: campaign.verificationDeadline,
    vouchers_sold: campaign.vouchersSold,
    funded_amount: campaign.fundedAmount,
    withdrawn_amount: campaign.withdrawnAmount,
    refunded_amount: campaign.refundedAmount,
    verified_units: campaign.verifiedUnits,
    retired_units: Math.min(campaign.verifiedUnits, campaign.unitPerVoucher * 4),
  });
}

export function getFallbackReceipt(voucherId) {
  return demoReceipts.find((receipt) => receipt.voucherId === voucherId) || null;
}

export function getFallbackProof(projectId) {
  return demoProofs.find((proof) => proof.projectId === Number(projectId)) || null;
}
