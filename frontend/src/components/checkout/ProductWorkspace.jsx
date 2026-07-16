import {
  BadgeCheck,
  Banknote,
  Clock3,
  Leaf,
  ReceiptText,
  Recycle,
  ShieldCheck,
  ShoppingCart,
  Undo2,
  Zap,
} from "lucide-react";
import { explorerTx, stroopsToXlm, shortAddress } from "../../lib/stellar";
import { formatDeadline } from "../../lib/viewModel";
import { Metric } from "../ui/Primitives";

function ImpactReceipt({ address, campaign, checkoutStage, lastTx, onOpenReceipt, preview, project, quantity }) {
  const txLabel = lastTx?.hash ? shortAddress(lastTx.hash) : "Awaiting tx";
  const buyer = address ? shortAddress(address) : "Walk-in customer";
  const verified = project.verified_units > 0 ? "Verified impact available" : "Pending verification";
  const stageLabel = checkoutStage === "receipt" ? "Receipt issued" : "Quote ready";

  return (
    <section className={`tool-panel receipt-panel receipt-${checkoutStage}`}>
      <div className="panel-title">
        <ReceiptText size={18} aria-hidden="true" />
        <div>
          <span>Customer proof</span>
          <h3>Impact Receipt</h3>
        </div>
      </div>
      <div className="receipt-stage receipt-reveal">
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

function CheckoutPanel({
  busy,
  canBuy,
  checkoutStage,
  displayProject,
  onBuy,
  onQuantityChange,
  preview,
  quantity,
  refundPolicyLabel,
  selectedCampaign,
}) {
  return (
    <section className="tool-panel checkout-panel product-zone product-zone-checkout">
      <div className="panel-title">
        <ShoppingCart size={18} aria-hidden="true" />
        <div>
          <span>Checkout</span>
          <h3>Customer payment</h3>
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
          onChange={(event) => onQuantityChange(event.target.value)}
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
        <strong>{selectedCampaign.contractBacked ? "Vault ready" : "Preview only"}</strong>
        <span>Deadline</span>
        <strong>{formatDeadline(displayProject.verification_deadline)}</strong>
        <span>Refund policy</span>
        <strong>{refundPolicyLabel}</strong>
      </div>
      {!selectedCampaign.contractBacked ? (
        <p className="panel-note">
          This campaign previews the product workflow. Select Da Nang Solar Classroom to execute a real
          Testnet purchase.
        </p>
      ) : null}
      <button className="button button-primary button-full" disabled={!canBuy || busy === "buy"} onClick={onBuy}>
        <ShoppingCart size={17} aria-hidden="true" />
        Buy Voucher
      </button>
    </section>
  );
}

function ImpactPassport({ busy, configured, holding, onRefund, onRetire, refundWindowOpen, voucherId, onVoucherIdChange }) {
  return (
    <section className="tool-panel product-zone product-zone-receipt">
      <div className="panel-title">
        <Leaf size={18} aria-hidden="true" />
        <div>
          <span>Receipt</span>
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
        <input type="number" min="1" value={voucherId} onChange={(event) => onVoucherIdChange(event.target.value)} />
      </label>
      <button className="button button-secondary button-full" disabled={!configured || !voucherId || busy === "retire"} onClick={onRetire}>
        <Recycle size={17} aria-hidden="true" />
        Retire Voucher
      </button>
      <button className="button button-ghost button-full refund-action" disabled={!configured || !voucherId || !refundWindowOpen || busy === "refund"} onClick={onRefund}>
        <Undo2 size={17} aria-hidden="true" />
        Claim Refund
      </button>
      <p className="panel-note refund-note">
        Refunds open only after the verification deadline if the campaign has no verified impact.
      </p>
    </section>
  );
}

function AdminActions({
  busy,
  configured,
  createForm,
  onCreate,
  onCreateFormChange,
  onVerify,
  onWithdraw,
  onWithdrawAmountChange,
  onReportHashChange,
  onVerifiedUnitsChange,
  reportHash,
  verifiedUnits,
  withdrawAmount,
}) {
  return (
    <section className="admin-grid">
      <div className="tool-panel product-zone product-zone-verification">
        <div className="panel-title">
          <BadgeCheck size={18} aria-hidden="true" />
          <div>
            <span>Verification</span>
            <h3>Verify Impact</h3>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Verified units
            <input type="number" min="1" value={verifiedUnits} onChange={(event) => onVerifiedUnitsChange(event.target.value)} />
          </label>
          <label>
            Report hash
            <input value={reportHash} onChange={(event) => onReportHashChange(event.target.value)} />
          </label>
        </div>
        <button className="button button-secondary" disabled={!configured || busy === "verify"} onClick={onVerify}>
          <BadgeCheck size={17} aria-hidden="true" />
          Verify Project
        </button>
      </div>

      <div className="tool-panel product-zone product-zone-vault">
        <div className="panel-title">
          <Banknote size={18} aria-hidden="true" />
          <div>
            <span>Vault</span>
            <h3>Withdraw Funds</h3>
          </div>
        </div>
        <label>
          Amount in stroops
          <input type="number" min="1" value={withdrawAmount} onChange={(event) => onWithdrawAmountChange(event.target.value)} />
        </label>
        <button className="button button-secondary" disabled={!configured || busy === "withdraw"} onClick={onWithdraw}>
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
            <input value={createForm.title} onChange={(event) => onCreateFormChange({ title: event.target.value })} />
          </label>
          <label>
            Payment token
            <input value={createForm.paymentToken} onChange={(event) => onCreateFormChange({ paymentToken: event.target.value })} />
          </label>
          <label>
            Price in stroops
            <input type="number" value={createForm.pricePerVoucher} onChange={(event) => onCreateFormChange({ pricePerVoucher: event.target.value })} />
          </label>
          <label>
            Units per voucher
            <input type="number" value={createForm.unitPerVoucher} onChange={(event) => onCreateFormChange({ unitPerVoucher: event.target.value })} />
          </label>
          <label>
            Impact unit
            <input value={createForm.impactUnit} onChange={(event) => onCreateFormChange({ impactUnit: event.target.value })} />
          </label>
          <label>
            Metadata hash
            <input value={createForm.metadataHash} onChange={(event) => onCreateFormChange({ metadataHash: event.target.value })} />
          </label>
          <label>
            Verification deadline
            <input
              type="number"
              min={Math.floor(Date.now() / 1000) + 1}
              value={createForm.verificationDeadline}
              onChange={(event) => onCreateFormChange({ verificationDeadline: event.target.value })}
            />
          </label>
        </div>
        <button className="button button-secondary" disabled={!configured || busy === "create"} onClick={onCreate}>
          <ShieldCheck size={17} aria-hidden="true" />
          Create Campaign
        </button>
      </details>
    </section>
  );
}

export function ProductWorkspace({
  address,
  busy,
  canBuySelectedCampaign,
  checkoutStage,
  configured,
  createForm,
  displayProject,
  holding,
  lastTx,
  onBuy,
  onCreate,
  onCreateFormChange,
  onOpenReceipt,
  onQuantityChange,
  onRefund,
  onReportHashChange,
  onRetire,
  onVerifiedUnitsChange,
  onVerify,
  onVoucherIdChange,
  onWithdraw,
  onWithdrawAmountChange,
  preview,
  quantity,
  refundPolicyLabel,
  refundRiskAmount,
  refundWindowOpen,
  reportHash,
  retiredRatio,
  selectedCampaign,
  selectedFlow,
  totalImpact,
  vaultBalance,
  verificationRatio,
  verifiedUnits,
  voucherId,
  withdrawAmount,
}) {
  return (
    <>
      <main className="dashboard-grid product-workspace">
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
            <Metric icon={Zap} label="Voucher impact" value={`${displayProject.unit_per_voucher} units`} detail={displayProject.impact_unit} />
            <Metric icon={Banknote} label="Voucher price" value={`${stroopsToXlm(displayProject.price_per_voucher)} XLM`} detail="Micropayment checkout add-on" tone="blue" />
            <Metric icon={Leaf} label="Vouchers sold" value={displayProject.vouchers_sold.toLocaleString()} detail={`${totalImpact.toLocaleString()} units funded`} tone="green" />
            <Metric icon={BadgeCheck} label="Verified units" value={displayProject.verified_units.toLocaleString()} detail="Report-backed impact" tone="gold" />
            <Metric icon={Clock3} label="Verification deadline" value={formatDeadline(displayProject.verification_deadline)} detail={refundPolicyLabel} tone={refundWindowOpen ? "danger" : "blue"} />
          </div>

          <div className="vault-ledger">
            <div className="ledger-header">
              <div>
                <span className="eyebrow">Smart contract vault</span>
                <h3>{selectedCampaign.contractBacked ? "Escrowed funds release only after verification" : "Preview campaign awaits contract deployment"}</h3>
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
          <CheckoutPanel
            busy={busy}
            canBuy={canBuySelectedCampaign}
            checkoutStage={checkoutStage}
            displayProject={displayProject}
            onBuy={onBuy}
            onQuantityChange={onQuantityChange}
            preview={preview}
            quantity={quantity}
            refundPolicyLabel={refundPolicyLabel}
            selectedCampaign={selectedCampaign}
          />
          <ImpactReceipt
            address={address}
            campaign={selectedCampaign}
            checkoutStage={checkoutStage}
            lastTx={lastTx}
            onOpenReceipt={onOpenReceipt}
            preview={preview}
            project={displayProject}
            quantity={Number(quantity || 0)}
          />
          <ImpactPassport
            busy={busy}
            configured={configured}
            holding={holding}
            onRefund={onRefund}
            onRetire={onRetire}
            onVoucherIdChange={onVoucherIdChange}
            refundWindowOpen={refundWindowOpen}
            voucherId={voucherId}
          />
        </aside>
      </main>

      <AdminActions
        busy={busy}
        configured={configured}
        createForm={createForm}
        onCreate={onCreate}
        onCreateFormChange={onCreateFormChange}
        onReportHashChange={onReportHashChange}
        onVerifiedUnitsChange={onVerifiedUnitsChange}
        onVerify={onVerify}
        onWithdraw={onWithdraw}
        onWithdrawAmountChange={onWithdrawAmountChange}
        reportHash={reportHash}
        verifiedUnits={verifiedUnits}
        withdrawAmount={withdrawAmount}
      />
    </>
  );
}
