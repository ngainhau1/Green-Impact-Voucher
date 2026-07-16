import { ExternalLink, ReceiptText, ShieldCheck } from "lucide-react";
import { explorerContract, explorerTx, shortAddress, stroopsToXlm } from "../../lib/stellar";
import { formatDateTime, makeProofLink } from "../../lib/viewModel";
import { ProofItem, PublicProofHeader } from "../ui/Primitives";

export function PublicReceiptPage({ copied, onCopy, proof, receipt, status }) {
  const campaign = proof?.campaign;
  const contractId = proof?.contractId || campaign?.contractId;

  return (
    <div className="app-shell public-proof-shell receipt-proof-shell">
      <PublicProofHeader status={status} onCopy={onCopy} copied={copied} />

      <section className="public-proof-hero receipt-public-hero">
        <div>
          <span className="eyebrow">Public impact receipt</span>
          <h2>{receipt.campaign}</h2>
          <p>
            A shareable customer receipt that links checkout payment, escrow custody, verification evidence,
            refund state, and Stellar transaction proof.
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
        <section className="tool-panel public-receipt-card textured-receipt-card">
          <div className="panel-title">
            <ReceiptText size={18} aria-hidden="true" />
            <div>
              <span>Receipt ID</span>
              <h3>{receipt.voucherId}</h3>
            </div>
          </div>
          <div className="receipt-paper public-receipt-paper receipt-reveal">
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

        <aside className="tool-panel public-proof-card satellite-mini-card">
          <img src="/assets/visuals/satellite-proof-map.svg" alt="" />
          <div className="satellite-scan" aria-hidden="true" />
          <div className="public-proof-card-content">
            <div className="panel-title">
              <ShieldCheck size={18} aria-hidden="true" />
              <div>
                <span>Settlement proof</span>
                <h3>{proof?.network || "Stellar Testnet"}</h3>
              </div>
            </div>
            {contractId ? (
              <ProofItem label="Contract" value={shortAddress(contractId)} link={explorerContract(contractId)} />
            ) : null}
            <ProofItem label="Campaign" value={`#${receipt.projectId}`} link={makeProofLink(receipt.projectId)} />
            <ProofItem label="Escrow status" value={campaign?.verifiedUnits > 0 ? "Verified payout path" : "Refund protected"} />
            <ProofItem label="Updated" value={formatDateTime(proof?.updatedAt || receipt.issuedAt)} />
          </div>
        </aside>
      </main>
    </div>
  );
}
