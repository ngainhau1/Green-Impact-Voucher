import { Banknote, ExternalLink, ReceiptText, Satellite } from "lucide-react";
import { explorerTx, shortAddress, stroopsToXlm } from "../../lib/stellar";
import { makeReceiptLink } from "../../lib/viewModel";
import { ProofItem, PublicProofHeader } from "../ui/Primitives";

export function ProofTimelinePage({ copied, onCopy, proof, status }) {
  const campaign = proof.campaign;
  const isRefundPath = proof.timeline.some((item) => item.stage === "refund_voucher");

  return (
    <div className={`app-shell public-proof-shell ${isRefundPath ? "refund-proof-shell" : "verified-proof-shell"}`}>
      <PublicProofHeader status={status} onCopy={onCopy} copied={copied} />

      <section className="public-proof-hero timeline-hero">
        <div>
          <span className="eyebrow">{isRefundPath ? "Refund protection proof" : "Verified campaign proof"}</span>
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

      <main className="public-proof-grid proof-map-grid">
        <section className="proof-map-panel">
          <img src="/assets/visuals/satellite-proof-map.svg" alt="" />
          <div className="satellite-scan" aria-hidden="true" />
          <div className="proof-map-copy">
            <Satellite size={20} aria-hidden="true" />
            <span>{proof.network}</span>
            <strong>{isRefundPath ? "Refund path confirmed" : "Verified payout path"}</strong>
            <p>{campaign.reportHash}</p>
          </div>
        </section>

        <section className="proof-timeline-card">
          <div className="panel-title">
            <Satellite size={18} aria-hidden="true" />
            <div>
              <span>Ordered Testnet proof</span>
              <h3>Proof Timeline</h3>
            </div>
          </div>
          <div className="proof-timeline">
            {proof.timeline.map((item, index) => (
              <article className={`timeline-item ${item.stage === "refund_voucher" ? "timeline-refund" : ""}`} key={`${item.stage}-${item.hash}`}>
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

        <aside className="tool-panel public-proof-card proof-finance-card">
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
