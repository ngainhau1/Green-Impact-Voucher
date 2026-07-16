import { ExternalLink, ReceiptText, Satellite, ShieldCheck, ShoppingCart, Wallet } from "lucide-react";
import { explorerContract, shortAddress } from "../../lib/stellar";
import { makeProofLink, makeReceiptLink } from "../../lib/viewModel";
import { ProofItem } from "../ui/Primitives";

export function SatelliteProofHero({
  address,
  busy,
  configured,
  contractId,
  displayProject,
  network,
  onConnect,
  onOpenCheckout,
}) {
  return (
    <section className="satellite-hero">
      <div className="satellite-hero-copy">
        <span className="eyebrow">Satellite proof plus solar classroom finance</span>
        <h2>Green checkout finance, verified on Stellar</h2>
        <p>
          Every customer payment becomes escrowed impact, verifier evidence, refund protection, and a
          receipt-grade proof page that can be shared without a wallet.
        </p>
        <div className="hero-actions">
          <button className="button button-primary" type="button" onClick={onOpenCheckout}>
            <ShoppingCart size={17} aria-hidden="true" />
            Open Checkout
          </button>
          <a className="button button-ghost" href={makeProofLink(1)}>
            <Satellite size={17} aria-hidden="true" />
            View Proof Timeline
          </a>
          <a className="button button-ghost" href={makeReceiptLink("voucher-1")}>
            <ReceiptText size={17} aria-hidden="true" />
            Public Receipt
          </a>
          <button className="button button-secondary" type="button" onClick={onConnect} disabled={busy === "wallet"}>
            <Wallet size={17} aria-hidden="true" />
            {address ? "Wallet connected" : "Connect wallet"}
          </button>
        </div>
      </div>

      <div className="satellite-proof-scene" aria-label="Satellite proof map">
        <img src="/assets/visuals/satellite-proof-map.svg" alt="" />
        <div className="satellite-scan" aria-hidden="true" />
        <div className="proof-orbit proof-orbit-one" aria-hidden="true" />
        <div className="proof-orbit proof-orbit-two" aria-hidden="true" />
        <div className="proof-stack">
          <ProofItem label="Network" value={network.name} />
          <ProofItem
            label="Contract"
            value={configured ? shortAddress(contractId) : "Not configured"}
            link={configured ? explorerContract(contractId) : undefined}
          />
          <ProofItem label="Payment asset" value={shortAddress(displayProject.payment_token)} />
          <ProofItem label="Active report" value={displayProject.report_hash || "Pending verification"} />
        </div>
        <a className="satellite-contract-link" href={explorerContract(contractId)} target="_blank" rel="noreferrer">
          <ShieldCheck size={16} aria-hidden="true" />
          Testnet proof
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
