import { createElement } from "react";
import {
  BadgeCheck,
  ExternalLink,
  ReceiptText,
  Satellite,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { explorerTx, shortAddress } from "../../lib/stellar";

export function ProofItem({ label, value, link }) {
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

export function Metric({ icon, label, value, detail, tone = "default" }) {
  return (
    <div className={`metric metric-${tone}`}>
      <div className="metric-icon">
        {createElement(icon, { "aria-hidden": "true", size: 18 })}
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}

export function StatusBadge({ children, icon = ShieldCheck }) {
  return (
    <span className="status-badge">
      {createElement(icon, { "aria-hidden": "true", size: 16 })}
      {children}
    </span>
  );
}

export function Topbar({ configured, contractUrl, address, busy, onConnect }) {
  return (
    <header className="topbar">
      <a className="brand-block public-brand" href="#/checkout/1">
        <img src="/impact-mark.svg" alt="" />
        <div>
          <span>Stellar Testnet MVP</span>
          <h1>Green Impact Voucher</h1>
        </div>
      </a>
      <div className="topbar-actions">
        <span className={`network-pill ${configured ? "ready" : "demo"}`}>
          {configured ? "Contract linked" : "Demo data"}
        </span>
        {configured ? (
          <a className="icon-link" href={contractUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} aria-hidden="true" />
            Contract
          </a>
        ) : null}
        <button className="button button-primary" onClick={onConnect} disabled={busy === "wallet"}>
          <Wallet size={17} aria-hidden="true" />
          {address ? shortAddress(address) : "Connect Freighter"}
        </button>
      </div>
    </header>
  );
}

export function RoleCard({ flow, active, onClick, icon }) {
  return (
    <button className={`role-card ${active ? "active" : ""}`} type="button" onClick={onClick}>
      {createElement(icon, { "aria-hidden": "true", size: 18 })}
      <span>{flow.label}</span>
      <strong>{flow.title}</strong>
      <p>{flow.detail}</p>
    </button>
  );
}

export function FlowStep({ item, index, icon }) {
  return (
    <div className="flow-step">
      <div className="step-index">{String(index + 1).padStart(2, "0")}</div>
      {createElement(icon, { "aria-hidden": "true", size: 18 })}
      <strong>{item.label}</strong>
      <span>{item.detail}</span>
    </div>
  );
}

export function TxNotice({ tx, error }) {
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

export function PublicProofHeader({ status, onCopy, copied }) {
  return (
    <header className="topbar public-topbar">
      <a className="brand-block public-brand" href="#/checkout/1">
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
          <ReceiptText size={16} aria-hidden="true" />
          {copied ? "Copied" : "Copy page"}
        </button>
      </div>
    </header>
  );
}

export function PublicLoading({ title }) {
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

export function PublicNotFound({ title, detail }) {
  return (
    <div className="app-shell public-proof-shell">
      <PublicProofHeader status="fallback" onCopy={() => {}} copied={false} />
      <section className="public-proof-hero">
        <span className="eyebrow">Proof unavailable</span>
        <h2>{title}</h2>
        <p>{detail}</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#/checkout/1">
            <Satellite size={17} aria-hidden="true" />
            Back to checkout
          </a>
          <a className="button button-ghost" href="#/proof/1">
            <BadgeCheck size={17} aria-hidden="true" />
            View verified proof
          </a>
        </div>
      </section>
    </div>
  );
}
