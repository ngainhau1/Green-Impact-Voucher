import QRCode from "react-qr-code";
import { Copy, Link2, QrCode, ShieldCheck, ShoppingCart, Store } from "lucide-react";
import { formatDeadline } from "../../lib/viewModel";
import { stroopsToXlm } from "../../lib/stellar";

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
          <div className="qr-frame qr-proof-pulse">
            <QRCode value={checkoutLink} size={156} bgColor="#fffdf8" fgColor="#123d35" />
          </div>
          <span>{campaign.checkoutSlug}</span>
        </div>
      </div>
    </section>
  );
}

export function MerchantConsole({
  apiError,
  apiStatus,
  campaigns,
  checkoutLink,
  checkoutSession,
  copied,
  merchantDashboard,
  onCopyCheckout,
  onOpenCheckout,
  onOpenProof,
  onSelectCampaign,
  selectedCampaign,
}) {
  return (
    <section className="merchant-console" aria-label="Merchant campaign console">
      <div className="console-header">
        <div>
          <span className="eyebrow">Merchant Console</span>
          <h2>Campaign checkout operations</h2>
          <p>
            Manage QR checkout links, watch vault custody, and keep public proof visible before payout.
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
              onSelect={onSelectCampaign}
              onOpenCheckout={onOpenCheckout}
              onOpenProof={onOpenProof}
            />
          ))}
        </div>
        <CheckoutGenerator
          campaign={selectedCampaign}
          checkoutLink={checkoutLink}
          checkoutSession={checkoutSession}
          copied={copied}
          onCopy={onCopyCheckout}
          onOpenCheckout={onOpenCheckout}
          onOpenProof={onOpenProof}
        />
      </div>
    </section>
  );
}
