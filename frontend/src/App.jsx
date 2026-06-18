import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import {
  BadgeCheck,
  Banknote,
  Building2,
  Clock3,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Leaf,
  Link2,
  QrCode,
  Recycle,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Store,
  Undo2,
  UserRound,
  Wallet,
  Zap,
} from "lucide-react";
import {
  createCheckoutSession,
  fetchCampaigns,
  fetchCheckoutSession,
  fetchMerchantDashboard,
  fetchProof,
  fetchReceipt,
} from "./lib/api";
import {
  buyVoucher,
  connectWallet,
  CONTRACT_ID,
  createProject,
  DEFAULT_PAYMENT_TOKEN,
  explorerContract,
  explorerTx,
  fetchHolding,
  fetchProject,
  isContractConfigured,
  NETWORK,
  refundVoucher,
  retireVoucher,
  shortAddress,
  stroopsToXlm,
  verifyProject,
  withdrawFunds,
} from "./lib/stellar";
import { demoCampaigns, demoHolding, demoProject, demoProofs, demoReceipts, PROJECT_ID } from "./lib/demoData";

const flowTabs = [
  {
    id: "customer",
    label: "Customer Checkout",
    title: "Cafe checkout pilot",
    metric: "0.10 XLM voucher",
    detail: "A shopper adds verified solar impact during payment.",
    icon: UserRound,
  },
  {
    id: "merchant",
    label: "Merchant Console",
    title: "Campaign finance view",
    metric: "Escrowed payout",
    detail: "The merchant tracks campaigns, checkout links, vault balances, and public proof.",
    icon: Store,
  },
  {
    id: "verifier",
    label: "Verifier Vault",
    title: "Report-gated release",
    metric: "Proof before payout",
    detail: "Funds unlock only after verified impact units are recorded.",
    icon: ClipboardCheck,
  },
];

const financeFlow = [
  { label: "Checkout", detail: "Customer scans QR or opens a checkout link", icon: ShoppingCart },
  { label: "Vault", detail: "Funds move into Soroban escrow", icon: Banknote },
  { label: "Verification", detail: "Impact report unlocks payout", icon: BadgeCheck },
  { label: "Receipt", detail: "Customer receives public proof", icon: ReceiptText },
];

const DEFAULT_DEADLINE_SECONDS = 30 * 24 * 60 * 60;

function defaultVerificationDeadline() {
  return Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_SECONDS;
}

function asNumber(value) {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string" && value !== "") return Number(value);
  return 0;
}

function normalizeProject(project) {
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

function normalizeHolding(holding) {
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

function getContractCampaign(campaigns = demoCampaigns) {
  return campaigns.find((campaign) => campaign.contractBacked) || campaigns[0] || demoCampaigns[0];
}

function getCampaignByProjectId(projectId, campaigns = demoCampaigns) {
  return campaigns.find((campaign) => campaign.projectId === Number(projectId)) || getContractCampaign(campaigns);
}

function getCheckoutRouteFromHash() {
  if (typeof window === "undefined") return { projectId: PROJECT_ID, sessionId: "" };
  const match = window.location.hash.match(/^#\/checkout\/(\d+)(?:\?session=([^&]+))?/);
  return {
    projectId: match ? Number(match[1]) : PROJECT_ID,
    sessionId: match?.[2] ? decodeURIComponent(match[2]) : "",
  };
}

function getPublicRouteFromHash() {
  if (typeof window === "undefined") return { type: "app" };
  const hash = window.location.hash;
  const receiptMatch = hash.match(/^#\/receipt\/([^?&]+)/);
  if (receiptMatch) {
    return { type: "receipt", voucherId: decodeURIComponent(receiptMatch[1]) };
  }
  const proofMatch = hash.match(/^#\/proof\/(\d+)/);
  if (proofMatch) {
    return { type: "proof", projectId: Number(proofMatch[1]) };
  }
  const checkoutRoute = getCheckoutRouteFromHash();
  if (hash.startsWith("#/checkout/")) {
    return { type: "checkout", ...checkoutRoute };
  }
  return { type: "app" };
}

function getCheckoutProjectIdFromHash() {
  return getCheckoutRouteFromHash().projectId;
}

function makeHashLink(hash) {
  if (typeof window === "undefined") return hash;
  return `${window.location.origin}${window.location.pathname}${hash}`;
}

function makeCheckoutLink(projectId) {
  return makeHashLink(`#/checkout/${projectId}`);
}

function makeReceiptLink(voucherId) {
  return makeHashLink(`#/receipt/${encodeURIComponent(voucherId)}`);
}

function makeProofLink(projectId) {
  return makeHashLink(`#/proof/${projectId}`);
}

function openHashRoute(hash) {
  if (typeof window !== "undefined") {
    window.location.hash = hash.replace(/^#/, "");
  }
}

function formatDeadline(seconds) {
  const value = Number(seconds || 0);
  if (!value) return "No deadline";
  return new Date(value * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isRefundWindowOpen(project) {
  return (
    Number(project?.verified_units || 0) === 0 &&
    Number(project?.verification_deadline || 0) > 0 &&
    Math.floor(Date.now() / 1000) > Number(project.verification_deadline)
  );
}

function getRefundPolicyLabel(project, campaign) {
  if (!campaign.contractBacked) return "Preview only";
  if (Number(project.verified_units || 0) > 0) return "Verification complete";
  if (isRefundWindowOpen(project)) return "Refund window open";
  return `Protected until ${formatDeadline(project.verification_deadline)}`;
}

function campaignToProject(campaign, liveProject) {
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

function Metric({ icon, label, value, detail, tone = "default" }) {
  const Glyph = icon;
  return (
    <div className={`metric metric-${tone}`}>
      <div className="metric-icon">
        <Glyph aria-hidden="true" size={18} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}

function ProofItem({ label, value, link }) {
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
    </>
  );

  if (link) {
    return (
      <a className="proof-item proof-link" href={link} target="_blank" rel="noreferrer">
        {content}
        <ExternalLink size={15} aria-hidden="true" />
      </a>
    );
  }

  return <div className="proof-item">{content}</div>;
}

function FlowStep({ item, index }) {
  const Glyph = item.icon;
  return (
    <div className="flow-step">
      <div className="step-index">{String(index + 1).padStart(2, "0")}</div>
      <Glyph size={18} aria-hidden="true" />
      <strong>{item.label}</strong>
      <span>{item.detail}</span>
    </div>
  );
}

function RoleCard({ flow, active, onClick }) {
  const Glyph = flow.icon;
  return (
    <button className={`role-card ${active ? "active" : ""}`} type="button" onClick={onClick}>
      <Glyph size={18} aria-hidden="true" />
      <span>{flow.label}</span>
      <strong>{flow.title}</strong>
      <p>{flow.detail}</p>
    </button>
  );
}

function CampaignCard({ campaign, active, onSelect, onOpenCheckout, onOpenProof }) {
  const verificationLabel =
    campaign.verifiedUnits > 0 ? `${campaign.verifiedUnits.toLocaleString()} verified` : "Awaiting verifier";
  const refundLabel =
    campaign.verifiedUnits > 0
      ? "No refund risk"
      : campaign.refundStatus === "refund-window-open"
        ? "Refund open"
        : "Refund protected";

  return (
    <article className={`campaign-card ${active ? "active" : ""}`}>
      <button className="campaign-select" type="button" onClick={() => onSelect(campaign.projectId)}>
        <div className="campaign-card-top">
          <span className={`campaign-badge ${campaign.contractBacked ? "live" : "preview"}`}>
            {campaign.contractBacked ? "Contract-backed" : "Preview campaign"}
          </span>
          <strong>#{campaign.projectId}</strong>
        </div>
        <h3>{campaign.title}</h3>
        <p>
          {campaign.merchant} - {campaign.checkoutChannel}
        </p>
        <div className="campaign-card-metrics">
          <span>{campaign.vouchersSold.toLocaleString()} sold</span>
          <span>{stroopsToXlm(campaign.fundedAmount)} XLM funded</span>
          <span>{verificationLabel}</span>
          <span>{refundLabel}</span>
        </div>
      </button>
      <div className="campaign-card-actions">
        <button className="button button-ghost button-full" type="button" onClick={() => onOpenCheckout(campaign)}>
          <Link2 size={16} aria-hidden="true" />
          Open checkout
        </button>
        <button className="button button-secondary button-full" type="button" onClick={() => onOpenProof(campaign)}>
          <ShieldCheck size={16} aria-hidden="true" />
          View proof
        </button>
      </div>
    </article>
  );
}

function CheckoutGenerator({
  campaign,
  checkoutLink,
  checkoutSession,
  copied,
  onCopy,
  onOpenCheckout,
  onOpenProof,
}) {
  return (
    <section className="campaign-detail">
      <div className="panel-title">
        <QrCode size={18} aria-hidden="true" />
        <div>
          <span>QR checkout generator</span>
          <h3>{campaign.title}</h3>
        </div>
      </div>

      <div className="campaign-detail-grid">
        <div className="campaign-detail-copy">
          <div className="campaign-meta">
            <span>{campaign.status}</span>
            <span>{campaign.category}</span>
            <span>{campaign.location}</span>
            <span>Deadline {formatDeadline(campaign.verificationDeadline)}</span>
          </div>
          {checkoutSession?.projectId === campaign.projectId ? (
            <div className="session-chip">
              <span>Session</span>
              <strong>{checkoutSession.id}</strong>
              <span>Expires {new Date(checkoutSession.expiresAt).toLocaleTimeString()}</span>
            </div>
          ) : null}
          <p>
            {campaign.merchant} can place this QR at checkout. Customers open a focused payment flow,
            then receive receipt-grade proof after a contract-backed purchase.
          </p>
          <label>
            Checkout link
            <input readOnly value={checkoutLink} onFocus={(event) => event.target.select()} />
          </label>
          <div className="checkout-actions">
            <button className="button button-secondary" type="button" onClick={onCopy}>
              <Copy size={16} aria-hidden="true" />
              {copied ? "Copied" : "Copy link"}
            </button>
            <button className="button button-primary" type="button" onClick={() => onOpenCheckout(campaign)}>
              <ShoppingCart size={16} aria-hidden="true" />
              Open checkout
            </button>
            <button className="button button-ghost" type="button" onClick={() => onOpenProof(campaign)}>
              <ShieldCheck size={16} aria-hidden="true" />
              Proof timeline
            </button>
          </div>
        </div>

        <div className="qr-panel" aria-label={`QR checkout for ${campaign.title}`}>
          <div className="qr-frame">
            <QRCode value={checkoutLink} size={156} bgColor="#fffdf8" fgColor="#123d35" />
          </div>
          <span>{campaign.checkoutSlug}</span>
        </div>
      </div>
    </section>
  );
}

function ImpactReceipt({ address, project, campaign, preview, quantity, lastTx, checkoutStage, onOpenReceipt }) {
  const txLabel = lastTx?.hash ? shortAddress(lastTx.hash) : "Awaiting tx";
  const buyer = address ? shortAddress(address) : "Walk-in customer";
  const verified = project.verified_units > 0 ? "Verified impact available" : "Pending verification";
  const stageLabel = checkoutStage === "receipt" ? "Receipt issued" : "Quote ready";
  const refundPolicy = getRefundPolicyLabel(project, campaign);

  return (
    <section className={`tool-panel receipt-panel receipt-${checkoutStage}`}>
      <div className="panel-title">
        <ReceiptText size={18} aria-hidden="true" />
        <div>
          <span>Customer proof</span>
          <h3>Impact Receipt</h3>
        </div>
      </div>
      <div className="receipt-stage">
        <BadgeCheck size={16} aria-hidden="true" />
        <strong>{stageLabel}</strong>
        <span>{campaign.contractBacked ? "Soroban escrow campaign" : "Preview campaign"}</span>
      </div>
      <div className="receipt-paper">
        <div className="receipt-row">
          <span>Buyer</span>
          <strong>{buyer}</strong>
        </div>
        <div className="receipt-row">
          <span>Merchant</span>
          <strong>{campaign.merchant}</strong>
        </div>
        <div className="receipt-row">
          <span>Campaign</span>
          <strong>{project.title}</strong>
        </div>
        <div className="receipt-row">
          <span>Impact</span>
          <strong>
            {preview.impact.toLocaleString()} {project.impact_unit}
          </strong>
        </div>
        <div className="receipt-row">
          <span>Paid</span>
          <strong>{stroopsToXlm(preview.cost)} XLM</strong>
        </div>
        <div className="receipt-row">
          <span>Transaction</span>
          {lastTx?.hash ? (
            <a href={explorerTx(lastTx.hash)} target="_blank" rel="noreferrer">
              {txLabel}
            </a>
          ) : (
            <strong>{txLabel}</strong>
          )}
        </div>
        <div className="receipt-row">
          <span>Status</span>
          <strong>{verified}</strong>
        </div>
        <div className="receipt-row">
          <span>Refund policy</span>
          <strong>{refundPolicy}</strong>
        </div>
      </div>
      <div className="receipt-status">
        <BadgeCheck size={16} aria-hidden="true" />
        <span>
          {quantity || 0} voucher claim is tied to escrowed funds, verifier release rules, and public
          transaction proof.
        </span>
      </div>
      <button className="button button-ghost button-full" type="button" onClick={onOpenReceipt}>
        <ReceiptText size={16} aria-hidden="true" />
        Open public receipt
      </button>
    </section>
  );
}

function TxNotice({ tx, error }) {
  if (!tx && !error) return null;
  return (
    <section className={`notice ${error ? "notice-error" : "notice-success"}`} aria-live="polite">
      <div>
        <span>{error ? "Transaction failed" : "Transaction confirmed"}</span>
        <strong>{error || shortAddress(tx.hash)}</strong>
      </div>
      {tx?.hash ? (
        <a href={explorerTx(tx.hash)} target="_blank" rel="noreferrer">
          <ExternalLink size={16} aria-hidden="true" />
          Stellar Expert
        </a>
      ) : null}
    </section>
  );
}

function getFallbackReceipt(voucherId) {
  return demoReceipts.find((receipt) => receipt.voucherId === voucherId) || null;
}

function getFallbackProof(projectId) {
  return demoProofs.find((proof) => proof.projectId === Number(projectId)) || null;
}

function formatDateTime(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PublicProofHeader({ status, onCopy, copied }) {
  return (
    <header className="topbar public-topbar">
      <a className="brand-block public-brand" href={makeHashLink("#/checkout/1")}>
        <img src="/impact-mark.svg" alt="" />
        <div>
          <span>Public proof layer</span>
          <h1>Green Impact Voucher</h1>
        </div>
      </a>
      <div className="topbar-actions">
        <span className={`network-pill ${status === "connected" ? "ready" : "demo"}`}>
          {status === "loading" ? "Loading proof" : status === "connected" ? "API proof" : "Seed fallback"}
        </span>
        <button className="button button-secondary" type="button" onClick={onCopy}>
          <Copy size={16} aria-hidden="true" />
          {copied ? "Copied" : "Copy page"}
        </button>
      </div>
    </header>
  );
}

function PublicNotFound({ title, detail }) {
  return (
    <div className="app-shell public-proof-shell">
      <PublicProofHeader status="fallback" onCopy={() => {}} copied={false} />
      <section className="public-proof-hero">
        <span className="eyebrow">Proof unavailable</span>
        <h2>{title}</h2>
        <p>{detail}</p>
        <div className="hero-actions">
          <a className="button button-primary" href={makeHashLink("#/checkout/1")}>
            <ShoppingCart size={17} aria-hidden="true" />
            Back to checkout
          </a>
          <a className="button button-ghost" href={makeHashLink("#/proof/1")}>
            <ShieldCheck size={17} aria-hidden="true" />
            View verified proof
          </a>
        </div>
      </section>
    </div>
  );
}

function PublicLoading({ title }) {
  return (
    <div className="app-shell public-proof-shell">
      <PublicProofHeader status="loading" onCopy={() => {}} copied={false} />
      <section className="public-proof-hero">
        <span className="eyebrow">Loading public proof</span>
        <h2>{title}</h2>
        <p>Resolving receipt metadata, campaign proof, and Stellar Expert transaction links.</p>
      </section>
    </div>
  );
}

function PublicReceiptPage({ receipt, proof, status, copied, onCopy }) {
  const campaign = proof?.campaign;
  const contractId = proof?.contractId || campaign?.contractId || CONTRACT_ID;

  return (
    <div className="app-shell public-proof-shell">
      <PublicProofHeader status={status} onCopy={onCopy} copied={copied} />

      <section className="public-proof-hero receipt-public-hero">
        <div>
          <span className="eyebrow">Public impact receipt</span>
          <h2>{receipt.campaign}</h2>
          <p>
            This shareable receipt connects checkout payment, escrow custody, verifier evidence, refund
            state, and Stellar transaction proof without requiring a wallet connection.
          </p>
        </div>
        <div className="public-proof-actions">
          <a className="button button-primary" href={makeProofLink(receipt.projectId)}>
            <ShieldCheck size={17} aria-hidden="true" />
            Campaign proof
          </a>
          <a className="button button-ghost" href={explorerTx(receipt.transactionHash)} target="_blank" rel="noreferrer">
            <ExternalLink size={17} aria-hidden="true" />
            Stellar Expert
          </a>
        </div>
      </section>

      <main className="public-proof-grid">
        <section className="tool-panel public-receipt-card">
          <div className="panel-title">
            <ReceiptText size={18} aria-hidden="true" />
            <div>
              <span>Receipt ID</span>
              <h3>{receipt.voucherId}</h3>
            </div>
          </div>
          <div className="receipt-paper public-receipt-paper">
            <div className="receipt-row">
              <span>Buyer</span>
              <strong>{receipt.buyer}</strong>
            </div>
            <div className="receipt-row">
              <span>Merchant</span>
              <strong>{receipt.merchant}</strong>
            </div>
            <div className="receipt-row">
              <span>Campaign</span>
              <strong>{receipt.campaign}</strong>
            </div>
            <div className="receipt-row">
              <span>Impact funded</span>
              <strong>
                {receipt.impactAmount.toLocaleString()} {receipt.impactUnit}
              </strong>
            </div>
            <div className="receipt-row">
              <span>Paid</span>
              <strong>{stroopsToXlm(receipt.paidAmount)} XLM</strong>
            </div>
            <div className="receipt-row">
              <span>Transaction</span>
              <a href={explorerTx(receipt.transactionHash)} target="_blank" rel="noreferrer">
                {shortAddress(receipt.transactionHash)}
              </a>
            </div>
            <div className="receipt-row">
              <span>Verification</span>
              <strong>{receipt.verificationStatus}</strong>
            </div>
            <div className="receipt-row">
              <span>Refund status</span>
              <strong>{receipt.refundStatus}</strong>
            </div>
            <div className="receipt-row">
              <span>Report hash</span>
              <strong>{receipt.reportHash}</strong>
            </div>
            <div className="receipt-row">
              <span>Issued</span>
              <strong>{formatDateTime(receipt.issuedAt)}</strong>
            </div>
          </div>
        </section>

        <aside className="tool-panel public-proof-card">
          <div className="panel-title">
            <ShieldCheck size={18} aria-hidden="true" />
            <div>
              <span>Settlement proof</span>
              <h3>{proof?.network || "Stellar Testnet"}</h3>
            </div>
          </div>
          <ProofItem label="Contract" value={shortAddress(contractId)} link={explorerContract(contractId)} />
          <ProofItem label="Campaign" value={`#${receipt.projectId}`} link={makeProofLink(receipt.projectId)} />
          <ProofItem label="Escrow status" value={campaign?.verifiedUnits > 0 ? "Verified payout path" : "Refund protected"} />
          <ProofItem label="Updated" value={formatDateTime(proof?.updatedAt || receipt.issuedAt)} />
        </aside>
      </main>
    </div>
  );
}

function ProofTimelinePage({ proof, status, copied, onCopy }) {
  const campaign = proof.campaign;

  return (
    <div className="app-shell public-proof-shell">
      <PublicProofHeader status={status} onCopy={onCopy} copied={copied} />

      <section className="public-proof-hero">
        <div>
          <span className="eyebrow">Campaign proof timeline</span>
          <h2>{campaign.title}</h2>
          <p>
            A public chain of evidence for checkout, vault custody, verifier action, customer receipt,
            payout, and refund protection.
          </p>
        </div>
        <div className="public-proof-actions">
          {proof.receipts[0] ? (
            <a className="button button-primary" href={makeReceiptLink(proof.receipts[0].voucherId)}>
              <ReceiptText size={17} aria-hidden="true" />
              Public receipt
            </a>
          ) : null}
          {proof.contractExplorerUrl ? (
            <a className="button button-ghost" href={proof.contractExplorerUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={17} aria-hidden="true" />
              Contract proof
            </a>
          ) : null}
        </div>
      </section>

      <main className="public-proof-grid">
        <section className="proof-timeline-card">
          <div className="panel-title">
            <Clock3 size={18} aria-hidden="true" />
            <div>
              <span>Ordered Testnet proof</span>
              <h3>Proof Timeline</h3>
            </div>
          </div>
          <div className="proof-timeline">
            {proof.timeline.map((item, index) => (
              <article className="timeline-item" key={`${item.stage}-${item.hash}`}>
                <div className="timeline-index">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <span>{item.stage.replaceAll("_", " ")}</span>
                  <h4>{item.label}</h4>
                  <p>{item.meaning}</p>
                  <div className="timeline-meta">
                    <strong>{item.status}</strong>
                    <a href={item.stellarExpertUrl || explorerTx(item.hash)} target="_blank" rel="noreferrer">
                      {shortAddress(item.hash)}
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="tool-panel public-proof-card">
          <div className="panel-title">
            <Banknote size={18} aria-hidden="true" />
            <div>
              <span>Financial state</span>
              <h3>{campaign.contractBacked ? "Contract-backed" : "Preview proof"}</h3>
            </div>
          </div>
          <ProofItem label="Network" value={proof.network} />
          <ProofItem label="Vouchers sold" value={campaign.vouchersSold.toLocaleString()} />
          <ProofItem label="Escrow funded" value={`${stroopsToXlm(campaign.fundedAmount)} XLM`} />
          <ProofItem label="Verified units" value={campaign.verifiedUnits.toLocaleString()} />
          <ProofItem label="Refund status" value={campaign.refundStatus} />
          <ProofItem label="Report hash" value={campaign.reportHash} />
        </aside>
      </main>
    </div>
  );
}

export default function App() {
  const [activeFlow, setActiveFlow] = useState("customer");
  const [campaigns, setCampaigns] = useState(demoCampaigns);
  const [apiStatus, setApiStatus] = useState("loading");
  const [apiError, setApiError] = useState("");
  const [merchantDashboard, setMerchantDashboard] = useState(null);
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [routeSessionId, setRouteSessionId] = useState(getCheckoutRouteFromHash().sessionId);
  const [selectedCampaignId, setSelectedCampaignId] = useState(getCheckoutProjectIdFromHash);
  const [checkoutStage, setCheckoutStage] = useState("quote");
  const [copiedLink, setCopiedLink] = useState("");
  const [address, setAddress] = useState("");
  const [project, setProject] = useState(normalizeProject(demoProject));
  const [holding, setHolding] = useState(normalizeHolding(demoHolding));
  const [quantity, setQuantity] = useState(1);
  const [voucherId, setVoucherId] = useState("");
  const [verifiedUnits, setVerifiedUnits] = useState(project.verified_units || 100);
  const [reportHash, setReportHash] = useState("ipfs://solar-meter-report-june-v2");
  const [withdrawAmount, setWithdrawAmount] = useState(1000000);
  const [createForm, setCreateForm] = useState({
    projectId: PROJECT_ID,
    title: "Da Nang Solar Classroom",
    impactUnit: "kWh of verified solar energy",
    pricePerVoucher: 1000000,
    unitPerVoucher: 10,
    paymentToken: DEFAULT_PAYMENT_TOKEN,
    metadataHash: "ipfs://solar-classroom-metadata-v2",
    verificationDeadline: defaultVerificationDeadline(),
  });
  const [lastTx, setLastTx] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [publicRoute, setPublicRoute] = useState(getPublicRouteFromHash);
  const [publicReceipt, setPublicReceipt] = useState(null);
  const [publicProof, setPublicProof] = useState(null);
  const [publicProofStatus, setPublicProofStatus] = useState("idle");
  const [publicProofError, setPublicProofError] = useState("");

  const configured = isContractConfigured();
  const selectedFlow = flowTabs.find((tab) => tab.id === activeFlow) || flowTabs[0];
  const selectedCampaign = useMemo(
    () => getCampaignByProjectId(selectedCampaignId, campaigns),
    [campaigns, selectedCampaignId],
  );
  const displayProject = useMemo(
    () => campaignToProject(selectedCampaign, project),
    [project, selectedCampaign],
  );
  const checkoutLink = useMemo(
    () => checkoutSession?.checkoutUrl || makeCheckoutLink(selectedCampaign.projectId),
    [checkoutSession?.checkoutUrl, selectedCampaign.projectId],
  );
  const totalImpact = displayProject.vouchers_sold * displayProject.unit_per_voucher;
  const verificationRatio =
    totalImpact > 0 ? Math.min(displayProject.verified_units / totalImpact, 1) : 0;
  const retiredRatio =
    displayProject.verified_units > 0
      ? Math.min(displayProject.retired_units / displayProject.verified_units, 1)
      : 0;
  const vaultBalance = Math.max(
    displayProject.funded_amount - displayProject.withdrawn_amount - displayProject.refunded_amount,
    0,
  );
  const refundRiskAmount =
    displayProject.verified_units > 0
      ? 0
      : Math.max(
          displayProject.funded_amount - displayProject.withdrawn_amount - displayProject.refunded_amount,
          0,
        );
  const refundWindowOpen = selectedCampaign.contractBacked && isRefundWindowOpen(displayProject);
  const refundPolicyLabel = getRefundPolicyLabel(displayProject, selectedCampaign);
  const canBuySelectedCampaign = configured && selectedCampaign.contractBacked;

  const preview = useMemo(() => {
    const qty = Math.max(0, Number(quantity || 0));
    return {
      cost: displayProject.price_per_voucher * qty,
      impact: displayProject.unit_per_voucher * qty,
    };
  }, [displayProject.price_per_voucher, displayProject.unit_per_voucher, quantity]);

  useEffect(() => {
    let cancelled = false;

    async function loadProductLayer() {
      try {
        const [campaignResult, dashboardResult] = await Promise.all([
          fetchCampaigns(),
          fetchMerchantDashboard(),
        ]);
        if (cancelled) return;
        setCampaigns(campaignResult.data);
        setMerchantDashboard(dashboardResult.data);
        setApiStatus("connected");
        setApiError("");
      } catch (err) {
        if (cancelled) return;
        setCampaigns(demoCampaigns);
        setMerchantDashboard(null);
        setApiStatus("fallback");
        setApiError(err.message || "Product API unavailable. Using local seed data.");
      }
    }

    loadProductLayer();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function syncCheckoutRoute() {
      const route = getCheckoutRouteFromHash();
      const nextPublicRoute = getPublicRouteFromHash();
      setPublicRoute(nextPublicRoute);
      const campaign = getCampaignByProjectId(route.projectId, campaigns);
      setSelectedCampaignId(campaign.projectId);
      setRouteSessionId(route.sessionId);
      if (nextPublicRoute.type === "checkout") {
        setActiveFlow("customer");
        setCheckoutStage("quote");
      }
    }

    syncCheckoutRoute();
    window.addEventListener("hashchange", syncCheckoutRoute);
    return () => window.removeEventListener("hashchange", syncCheckoutRoute);
  }, [campaigns]);

  useEffect(() => {
    let cancelled = false;

    async function loadPublicProof() {
      if (publicRoute.type !== "receipt" && publicRoute.type !== "proof") {
        setPublicReceipt(null);
        setPublicProof(null);
        setPublicProofStatus("idle");
        setPublicProofError("");
        return;
      }

      setPublicProofStatus("loading");
      setPublicProofError("");

      if (publicRoute.type === "receipt") {
        try {
          const receiptResult = await fetchReceipt(publicRoute.voucherId);
          const receipt = receiptResult.data;
          const proofResult = await fetchProof(receipt.projectId);
          if (cancelled) return;
          setPublicReceipt(receipt);
          setPublicProof(proofResult.data);
          setPublicProofStatus("connected");
        } catch (err) {
          const fallbackReceipt = getFallbackReceipt(publicRoute.voucherId);
          const fallbackProof = fallbackReceipt ? getFallbackProof(fallbackReceipt.projectId) : null;
          if (cancelled) return;
          setPublicReceipt(fallbackReceipt);
          setPublicProof(fallbackProof);
          setPublicProofStatus(fallbackReceipt ? "fallback" : "missing");
          setPublicProofError(err.message || "Receipt proof could not be loaded.");
        }
        return;
      }

      try {
        const proofResult = await fetchProof(publicRoute.projectId);
        if (cancelled) return;
        setPublicReceipt(proofResult.data.receipts[0] || null);
        setPublicProof(proofResult.data);
        setPublicProofStatus("connected");
      } catch (err) {
        const fallbackProof = getFallbackProof(publicRoute.projectId);
        if (cancelled) return;
        setPublicReceipt(fallbackProof?.receipts[0] || null);
        setPublicProof(fallbackProof);
        setPublicProofStatus(fallbackProof ? "fallback" : "missing");
        setPublicProofError(err.message || "Campaign proof could not be loaded.");
      }
    }

    loadPublicProof();
    return () => {
      cancelled = true;
    };
  }, [publicRoute]);

  useEffect(() => {
    let cancelled = false;

    async function resolveRouteSession() {
      if (!routeSessionId || apiStatus === "fallback") return;
      try {
        const result = await fetchCheckoutSession(routeSessionId);
        if (cancelled) return;
        setCheckoutSession(result.data);
        setApiStatus("connected");
        setApiError("");
      } catch (err) {
        if (cancelled) return;
        setCheckoutSession(null);
        setApiError(err.message || "Checkout session could not be resolved.");
      }
    }

    resolveRouteSession();
    return () => {
      cancelled = true;
    };
  }, [apiStatus, routeSessionId]);

  useEffect(() => {
    let cancelled = false;

    async function prepareCheckoutSession() {
      if (apiStatus !== "connected" || routeSessionId) return;
      try {
        const result = await createCheckoutSession({
          projectId: selectedCampaign.projectId,
          quantity: Math.max(1, Number(quantity || 1)),
          buyerAddress: address || undefined,
        });
        if (cancelled) return;
        setCheckoutSession(result.data);
        setApiError("");
      } catch (err) {
        if (cancelled) return;
        setCheckoutSession(null);
        setApiStatus("fallback");
        setApiError(err.message || "Could not create checkout session. Using frontend checkout link.");
      }
    }

    prepareCheckoutSession();
    return () => {
      cancelled = true;
    };
  }, [address, apiStatus, quantity, routeSessionId, selectedCampaign.projectId]);

  async function refresh(currentAddress = address) {
    if (!configured || !currentAddress) return;
    const [projectResult, holdingResult] = await Promise.all([
      fetchProject(currentAddress, PROJECT_ID),
      fetchHolding(currentAddress, PROJECT_ID),
    ]);
    if (projectResult) setProject(normalizeProject(projectResult));
    if (holdingResult) setHolding(normalizeHolding(holdingResult));
  }

  async function handleConnect() {
    setBusy("wallet");
    setError("");
    try {
      const walletAddress = await connectWallet();
      setAddress(walletAddress);
      await refresh(walletAddress);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function runTx(label, action, onSuccess) {
    setBusy(label);
    setError("");
    setLastTx(null);
    try {
      if (!address) throw new Error("Connect Freighter first.");
      const result = await action();
      setLastTx(result);
      if (onSuccess) onSuccess(result);
      await refresh(address);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  function selectCampaign(projectId) {
    setSelectedCampaignId(projectId);
    setActiveFlow("merchant");
    setCopiedLink("");
    setCheckoutSession(null);
    setRouteSessionId("");
  }

  async function openCheckout(campaign) {
    setSelectedCampaignId(campaign.projectId);
    setActiveFlow("customer");
    setCheckoutStage("quote");
    setCopiedLink("");
    setRouteSessionId("");

    let targetLink = checkoutSession?.projectId === campaign.projectId ? checkoutSession.checkoutUrl : "";
    if (!targetLink && apiStatus === "connected") {
      try {
        const result = await createCheckoutSession({
          projectId: campaign.projectId,
          quantity: Math.max(1, Number(quantity || 1)),
          buyerAddress: address || undefined,
        });
        setCheckoutSession(result.data);
        targetLink = result.data.checkoutUrl;
        setApiError("");
      } catch (err) {
        setApiStatus("fallback");
        setApiError(err.message || "Could not create checkout session. Using frontend checkout link.");
      }
    }

    if (typeof window !== "undefined") {
      const hash = targetLink ? new URL(targetLink).hash : `#/checkout/${campaign.projectId}`;
      window.location.hash = hash.replace(/^#/, "");
    }
  }

  function openProof(campaign) {
    openHashRoute(`#/proof/${campaign.projectId}`);
  }

  function openReceipt() {
    openHashRoute("#/receipt/voucher-1");
  }

  async function copyCheckoutLink() {
    try {
      await navigator.clipboard.writeText(checkoutLink);
      setCopiedLink(checkoutLink);
      setError("");
    } catch {
      setError("Copy failed. Select the checkout link and copy it manually.");
    }
  }

  async function copyPublicPageLink() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(window.location.href);
      setError("");
    } catch {
      setError("Copy failed. Select the page URL and copy it manually.");
    }
  }

  if (publicRoute.type === "receipt") {
    if ((publicProofStatus === "idle" || publicProofStatus === "loading") && !publicReceipt) {
      return <PublicLoading title="Resolving receipt proof" />;
    }

    if (publicProofStatus === "missing" || (!publicReceipt && publicProofStatus !== "loading")) {
      return (
        <PublicNotFound
          title="Receipt was not found"
          detail={publicProofError || "This public receipt ID is not indexed by the product API."}
        />
      );
    }

    return (
      <PublicReceiptPage
        receipt={publicReceipt || getFallbackReceipt(publicRoute.voucherId)}
        proof={publicProof || getFallbackProof(1)}
        status={publicProofStatus}
        copied={copiedLink === (typeof window !== "undefined" ? window.location.href : "")}
        onCopy={copyPublicPageLink}
      />
    );
  }

  if (publicRoute.type === "proof") {
    if ((publicProofStatus === "idle" || publicProofStatus === "loading") && !publicProof) {
      return <PublicLoading title="Resolving campaign proof" />;
    }

    if (publicProofStatus === "missing" || (!publicProof && publicProofStatus !== "loading")) {
      return (
        <PublicNotFound
          title="Campaign proof was not found"
          detail={publicProofError || "This campaign proof is not indexed by the product API."}
        />
      );
    }

    return (
      <ProofTimelinePage
        proof={publicProof || getFallbackProof(publicRoute.projectId)}
        status={publicProofStatus}
        copied={copiedLink === (typeof window !== "undefined" ? window.location.href : "")}
        onCopy={copyPublicPageLink}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <img src="/impact-mark.svg" alt="" />
          <div>
            <span>Stellar Testnet MVP</span>
            <h1>Green Impact Voucher</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <span className={`network-pill ${configured ? "ready" : "demo"}`}>
            {configured ? "Contract linked" : "Demo data"}
          </span>
          {configured ? (
            <a className="icon-link" href={explorerContract(CONTRACT_ID)} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              Contract
            </a>
          ) : null}
          <button className="button button-primary" onClick={handleConnect} disabled={busy === "wallet"}>
            <Wallet size={17} aria-hidden="true" />
            {address ? shortAddress(address) : "Connect Freighter"}
          </button>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Financial application for verified local impact</span>
          <h2>Green checkout finance, verified on Stellar</h2>
          <p>
            Turn every merchant payment into a transparent impact voucher with escrow, verification, and
            on-chain receipts.
          </p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={handleConnect} disabled={busy === "wallet"}>
              <Wallet size={17} aria-hidden="true" />
              {address ? "Wallet connected" : "Connect wallet"}
            </button>
            {configured ? (
              <a className="button button-ghost" href={explorerContract(CONTRACT_ID)} target="_blank" rel="noreferrer">
                <ExternalLink size={17} aria-hidden="true" />
                View contract proof
              </a>
            ) : null}
          </div>
        </div>

        <div className="proof-card" aria-label="Network proof">
          <ProofItem label="Network" value={NETWORK.name} />
          <ProofItem
            label="Contract"
            value={configured ? shortAddress(CONTRACT_ID) : "Not configured"}
            link={configured ? explorerContract(CONTRACT_ID) : undefined}
          />
          <ProofItem label="Payment asset" value={shortAddress(displayProject.payment_token)} />
          <ProofItem label="Last verified report" value={displayProject.report_hash || "Pending verification"} />
        </div>
      </section>

      <section className="role-switcher" aria-label="Product roles">
        {flowTabs.map((flow) => (
          <RoleCard
            key={flow.id}
            flow={flow}
            active={activeFlow === flow.id}
            onClick={() => setActiveFlow(flow.id)}
          />
        ))}
      </section>

      <section className="flow-rail" aria-label="Financial flow">
        {financeFlow.map((item, index) => (
          <FlowStep key={item.label} item={item} index={index} />
        ))}
      </section>

      <section className="merchant-console" aria-label="Merchant campaign console">
        <div className="console-header">
          <div>
            <span className="eyebrow">Merchant Console</span>
            <h2>Campaign checkout operations</h2>
            <p>
              Manage local impact campaigns, generate customer checkout links, and keep contract-backed
              proof visible before payout.
            </p>
          </div>
          <span className="status-badge">
            <Store size={16} aria-hidden="true" />
            {campaigns.length} campaigns
          </span>
        </div>

        <div className="backend-strip" aria-label="Backend product API status">
          <div>
            <span>Product API</span>
            <strong>{apiStatus === "connected" ? "Connected" : "Seed fallback"}</strong>
          </div>
          <div>
            <span>Checkout sessions</span>
            <strong>{merchantDashboard?.checkoutSessions ?? 0}</strong>
          </div>
          <div>
            <span>Indexed proof</span>
            <strong>{merchantDashboard?.indexedTransactionCount ?? 8} tx refs</strong>
          </div>
          <div>
            <span>Escrow balance</span>
            <strong>{stroopsToXlm(merchantDashboard?.totals?.escrowBalance ?? 0)} XLM</strong>
          </div>
          <div>
            <span>Refund risk</span>
            <strong>{stroopsToXlm(merchantDashboard?.totals?.refundRiskAmount ?? 0)} XLM</strong>
          </div>
        </div>
        {apiError ? <p className="api-note">{apiError}</p> : null}

        <div className="console-grid">
          <div className="campaign-list" aria-label="Campaign list">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.projectId}
                campaign={campaign}
                active={selectedCampaign.projectId === campaign.projectId}
                onSelect={selectCampaign}
                onOpenCheckout={openCheckout}
                onOpenProof={openProof}
              />
            ))}
          </div>
          <CheckoutGenerator
            campaign={selectedCampaign}
            checkoutLink={checkoutLink}
            checkoutSession={checkoutSession}
            copied={copiedLink === checkoutLink}
            onCopy={copyCheckoutLink}
            onOpenCheckout={openCheckout}
            onOpenProof={openProof}
          />
        </div>
      </section>

      <main className="dashboard-grid">
        <section className="project-surface">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Project #{selectedCampaign.projectId}</span>
              <h2>{displayProject.title}</h2>
              <p>{selectedFlow.detail}</p>
            </div>
            <span className="status-badge">
              <ShieldCheck size={16} aria-hidden="true" />
              {selectedCampaign.contractBacked ? selectedFlow.metric : "Preview only"}
            </span>
          </div>

          <div className="metrics-grid">
            <Metric
              icon={Zap}
              label="Voucher impact"
              value={`${displayProject.unit_per_voucher} units`}
              detail={displayProject.impact_unit}
            />
            <Metric
              icon={Banknote}
              label="Voucher price"
              value={`${stroopsToXlm(displayProject.price_per_voucher)} XLM`}
              detail="Micropayment checkout add-on"
              tone="blue"
            />
            <Metric
              icon={Leaf}
              label="Vouchers sold"
              value={displayProject.vouchers_sold.toLocaleString()}
              detail="Customer-funded claims"
              tone="green"
            />
            <Metric
              icon={BadgeCheck}
              label="Verified units"
              value={displayProject.verified_units.toLocaleString()}
              detail="Report-backed impact"
              tone="gold"
            />
            <Metric
              icon={Clock3}
              label="Verification deadline"
              value={formatDeadline(displayProject.verification_deadline)}
              detail={refundPolicyLabel}
              tone={refundWindowOpen ? "danger" : "blue"}
            />
          </div>

          <div className="vault-ledger">
            <div className="ledger-header">
              <div>
                <span className="eyebrow">Smart contract vault</span>
                <h3>
                  {selectedCampaign.contractBacked
                    ? "Escrowed funds release only after verification"
                    : "Preview campaign awaits contract deployment"}
                </h3>
              </div>
              <strong>{stroopsToXlm(vaultBalance)} XLM in vault</strong>
            </div>
            <div className="ledger-strip">
              <div>
                <span>Total funded</span>
                <strong>{stroopsToXlm(displayProject.funded_amount)} XLM</strong>
              </div>
              <div>
                <span>Refunded</span>
                <strong>{stroopsToXlm(displayProject.refunded_amount)} XLM</strong>
              </div>
              <div>
                <span>Withdrawn</span>
                <strong>{stroopsToXlm(displayProject.withdrawn_amount)} XLM</strong>
              </div>
              <div>
                <span>Refund risk</span>
                <strong>{stroopsToXlm(refundRiskAmount)} XLM</strong>
              </div>
              <div>
                <span>Verification report</span>
                <strong>{displayProject.report_hash || "Pending"}</strong>
              </div>
            </div>
          </div>

          <div className="progress-grid">
            <div className="progress-block">
              <div>
                <span>Verification coverage</span>
                <strong>{Math.round(verificationRatio * 100)}%</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${verificationRatio * 100}%` }} />
              </div>
            </div>
            <div className="progress-block">
              <div>
                <span>Retired verified impact</span>
                <strong>{Math.round(retiredRatio * 100)}%</strong>
              </div>
              <div className="progress-track progress-track-green">
                <span style={{ width: `${retiredRatio * 100}%` }} />
              </div>
            </div>
          </div>
        </section>

        <aside className="operations-stack">
          <section className="tool-panel checkout-panel">
            <div className="panel-title">
              <ShoppingCart size={18} aria-hidden="true" />
              <div>
                <span>Primary flow</span>
                <h3>Customer Checkout</h3>
              </div>
            </div>
            <div className="checkout-context">
              <span>{checkoutStage === "receipt" ? "Receipt state" : "Quote state"}</span>
              <strong>{selectedCampaign.title}</strong>
              <p>{selectedCampaign.merchant}</p>
            </div>
            <label>
              Voucher quantity
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setCheckoutStage("quote");
                }}
              />
            </label>
            <div className="quote-grid">
              <span>Voucher price</span>
              <strong>{stroopsToXlm(displayProject.price_per_voucher)} XLM</strong>
              <span>Impact funded</span>
              <strong>
                {preview.impact.toLocaleString()} {displayProject.impact_unit}
              </strong>
              <span>Escrow status</span>
              <strong>
                {selectedCampaign.contractBacked
                  ? configured
                    ? "Vault ready"
                    : "Missing contract config"
                  : "Preview only"}
              </strong>
              <span>Verification deadline</span>
              <strong>{formatDeadline(displayProject.verification_deadline)}</strong>
              <span>Refund policy</span>
              <strong>{refundPolicyLabel}</strong>
            </div>
            {!selectedCampaign.contractBacked ? (
              <p className="panel-note">
                This campaign previews the product workflow. Select Da Nang Solar Classroom to execute a
                real Testnet purchase.
              </p>
            ) : null}
            <button
              className="button button-primary button-full"
              disabled={!canBuySelectedCampaign || busy === "buy"}
              onClick={() =>
                runTx(
                  "buy",
                  () => buyVoucher(address, PROJECT_ID, Number(quantity)),
                  () => setCheckoutStage("receipt"),
                )
              }
            >
              <ShoppingCart size={17} aria-hidden="true" />
              Buy Voucher
            </button>
          </section>

          <ImpactReceipt
            address={address}
            project={displayProject}
            campaign={selectedCampaign}
            preview={preview}
            quantity={Number(quantity || 0)}
            lastTx={lastTx}
            checkoutStage={checkoutStage}
            onOpenReceipt={openReceipt}
          />

          <section className="tool-panel">
            <div className="panel-title">
              <Leaf size={18} aria-hidden="true" />
              <div>
                <span>Customer ledger</span>
                <h3>Impact Passport</h3>
              </div>
            </div>
            <div className="passport-grid">
              <span>Active vouchers</span>
              <strong>{holding.active_vouchers}</strong>
              <span>Retired vouchers</span>
              <strong>{holding.retired_vouchers}</strong>
              <span>Refunded vouchers</span>
              <strong>{holding.refunded_vouchers}</strong>
              <span>Retired impact</span>
              <strong>{holding.retired_units} units</strong>
              <span>Refunded amount</span>
              <strong>{stroopsToXlm(holding.refunded_amount)} XLM</strong>
            </div>
            <label>
              Voucher ID
              <input
                type="number"
                min="1"
                value={voucherId}
                onChange={(event) => setVoucherId(event.target.value)}
              />
            </label>
            <button
              className="button button-secondary button-full"
              disabled={!configured || !voucherId || busy === "retire"}
              onClick={() => runTx("retire", () => retireVoucher(address, voucherId))}
            >
              <Recycle size={17} aria-hidden="true" />
              Retire Voucher
            </button>
            <button
              className="button button-ghost button-full refund-action"
              disabled={!configured || !voucherId || !refundWindowOpen || busy === "refund"}
              onClick={() => runTx("refund", () => refundVoucher(address, voucherId))}
            >
              <Undo2 size={17} aria-hidden="true" />
              Claim Refund
            </button>
            <p className="panel-note refund-note">
              Refunds open only after the verification deadline if the campaign has no verified impact.
            </p>
          </section>
        </aside>
      </main>

      <section className="admin-grid">
        <div className="tool-panel">
          <div className="panel-title">
            <BadgeCheck size={18} aria-hidden="true" />
            <div>
              <span>Verifier Vault</span>
              <h3>Verify Impact</h3>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Verified units
              <input
                type="number"
                min="1"
                value={verifiedUnits}
                onChange={(event) => setVerifiedUnits(event.target.value)}
              />
            </label>
            <label>
              Report hash
              <input value={reportHash} onChange={(event) => setReportHash(event.target.value)} />
            </label>
          </div>
          <button
            className="button button-secondary"
            disabled={!configured || busy === "verify"}
            onClick={() =>
              runTx("verify", () => verifyProject(address, PROJECT_ID, Number(verifiedUnits), reportHash))
            }
          >
            <BadgeCheck size={17} aria-hidden="true" />
            Verify Project
          </button>
        </div>

        <div className="tool-panel">
          <div className="panel-title">
            <Banknote size={18} aria-hidden="true" />
            <div>
              <span>Merchant Console</span>
              <h3>Withdraw Vault Funds</h3>
            </div>
          </div>
          <label>
            Amount in stroops
            <input
              type="number"
              min="1"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
            />
          </label>
          <button
            className="button button-secondary"
            disabled={!configured || busy === "withdraw"}
            onClick={() => runTx("withdraw", () => withdrawFunds(address, PROJECT_ID, withdrawAmount))}
          >
            <Banknote size={17} aria-hidden="true" />
            Withdraw Verified Funds
          </button>
        </div>

        <details className="tool-panel create-panel">
          <summary>
            <span>
              <ShieldCheck size={18} aria-hidden="true" />
              Create Merchant Campaign
            </span>
          </summary>
          <div className="form-grid">
            <label>
              Campaign title
              <input
                value={createForm.title}
                onChange={(event) => setCreateForm({ ...createForm, title: event.target.value })}
              />
            </label>
            <label>
              Payment token
              <input
                value={createForm.paymentToken}
                onChange={(event) => setCreateForm({ ...createForm, paymentToken: event.target.value })}
              />
            </label>
            <label>
              Price in stroops
              <input
                type="number"
                value={createForm.pricePerVoucher}
                onChange={(event) => setCreateForm({ ...createForm, pricePerVoucher: event.target.value })}
              />
            </label>
            <label>
              Units per voucher
              <input
                type="number"
                value={createForm.unitPerVoucher}
                onChange={(event) => setCreateForm({ ...createForm, unitPerVoucher: event.target.value })}
              />
            </label>
            <label>
              Impact unit
              <input
                value={createForm.impactUnit}
                onChange={(event) => setCreateForm({ ...createForm, impactUnit: event.target.value })}
              />
            </label>
            <label>
              Metadata hash
              <input
                value={createForm.metadataHash}
                onChange={(event) => setCreateForm({ ...createForm, metadataHash: event.target.value })}
              />
            </label>
            <label>
              Verification deadline
              <input
                type="number"
                min={Math.floor(Date.now() / 1000) + 1}
                value={createForm.verificationDeadline}
                onChange={(event) =>
                  setCreateForm({ ...createForm, verificationDeadline: event.target.value })
                }
              />
            </label>
          </div>
          <button
            className="button button-secondary"
            disabled={!configured || busy === "create"}
            onClick={() => runTx("create", () => createProject(address, createForm))}
          >
            <ShieldCheck size={17} aria-hidden="true" />
            Create Campaign
          </button>
        </details>
      </section>

      <section className="market-context">
        <div className="context-card">
          <Building2 aria-hidden="true" size={18} />
          <span>Merchant wedge</span>
          <strong>Vietnam checkout pilots</strong>
          <p>Designed for retailers, campus events, cafes, and SMEs that need proof-backed campaigns.</p>
        </div>
        <div className="context-card">
          <ShieldCheck aria-hidden="true" size={18} />
          <span>Settlement policy</span>
          <strong>Escrow before payout</strong>
          <p>Customer payments enter the contract vault and release only after verified delivery.</p>
        </div>
        <div className="context-card">
          <ReceiptText aria-hidden="true" size={18} />
          <span>Customer value</span>
          <strong>Receipt-grade proof</strong>
          <p>Each voucher creates a clear record of campaign, payment, transaction, and impact state.</p>
        </div>
      </section>

      <TxNotice tx={lastTx} error={error} />
    </div>
  );
}
