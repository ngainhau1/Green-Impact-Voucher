import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  Building2,
  ClipboardCheck,
  ExternalLink,
  Leaf,
  Recycle,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Store,
  UserRound,
  Wallet,
  Zap,
} from "lucide-react";
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
  retireVoucher,
  shortAddress,
  stroopsToXlm,
  verifyProject,
  withdrawFunds,
} from "./lib/stellar";
import { demoHolding, demoProject, PROJECT_ID } from "./lib/demoData";

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
    detail: "The merchant tracks sold vouchers, vault balance, and public proof.",
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
  { label: "Checkout", detail: "Customer buys a voucher", icon: ShoppingCart },
  { label: "Vault", detail: "Funds move into escrow", icon: Banknote },
  { label: "Verification", detail: "Impact report is recorded", icon: BadgeCheck },
  { label: "Receipt", detail: "Customer retires proof", icon: ReceiptText },
];

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
    vouchers_sold: asNumber(project?.vouchers_sold ?? demoProject.vouchers_sold),
    funded_amount: asNumber(project?.funded_amount ?? demoProject.funded_amount),
    withdrawn_amount: asNumber(project?.withdrawn_amount ?? demoProject.withdrawn_amount),
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
    active_units: asNumber(holding?.active_units ?? 0),
    retired_units: asNumber(holding?.retired_units ?? 0),
    paid_amount: asNumber(holding?.paid_amount ?? 0),
  };
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

function ImpactReceipt({ address, project, preview, quantity, lastTx }) {
  const txLabel = lastTx?.hash ? shortAddress(lastTx.hash) : "Awaiting tx";
  const buyer = address ? shortAddress(address) : "Walk-in customer";
  const verified = project.verified_units > 0 ? "Verified impact available" : "Pending verification";

  return (
    <section className="tool-panel receipt-panel">
      <div className="panel-title">
        <ReceiptText size={18} aria-hidden="true" />
        <div>
          <span>Customer proof</span>
          <h3>Impact Receipt</h3>
        </div>
      </div>
      <div className="receipt-paper">
        <div className="receipt-row">
          <span>Buyer</span>
          <strong>{buyer}</strong>
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
          <strong>{txLabel}</strong>
        </div>
        <div className="receipt-row">
          <span>Status</span>
          <strong>{verified}</strong>
        </div>
      </div>
      <div className="receipt-status">
        <BadgeCheck size={16} aria-hidden="true" />
        <span>{quantity || 0} voucher claim is tied to escrowed funds and verified release rules.</span>
      </div>
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

export default function App() {
  const [activeFlow, setActiveFlow] = useState("customer");
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
  });
  const [lastTx, setLastTx] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const configured = isContractConfigured();
  const selectedFlow = flowTabs.find((tab) => tab.id === activeFlow) || flowTabs[0];
  const totalImpact = project.vouchers_sold * project.unit_per_voucher;
  const verificationRatio = totalImpact > 0 ? Math.min(project.verified_units / totalImpact, 1) : 0;
  const retiredRatio = project.verified_units > 0 ? Math.min(project.retired_units / project.verified_units, 1) : 0;
  const vaultBalance = Math.max(project.funded_amount - project.withdrawn_amount, 0);

  const preview = useMemo(() => {
    const qty = Math.max(0, Number(quantity || 0));
    return {
      cost: project.price_per_voucher * qty,
      impact: project.unit_per_voucher * qty,
    };
  }, [project.price_per_voucher, project.unit_per_voucher, quantity]);

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

  async function runTx(label, action) {
    setBusy(label);
    setError("");
    setLastTx(null);
    try {
      if (!address) throw new Error("Connect Freighter first.");
      const result = await action();
      setLastTx(result);
      await refresh(address);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
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
          <ProofItem label="Payment asset" value={shortAddress(project.payment_token)} />
          <ProofItem label="Last verified report" value={project.report_hash || "Pending verification"} />
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

      <main className="dashboard-grid">
        <section className="project-surface">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Project #{PROJECT_ID}</span>
              <h2>{project.title}</h2>
              <p>{selectedFlow.detail}</p>
            </div>
            <span className="status-badge">
              <ShieldCheck size={16} aria-hidden="true" />
              {selectedFlow.metric}
            </span>
          </div>

          <div className="metrics-grid">
            <Metric
              icon={Zap}
              label="Voucher impact"
              value={`${project.unit_per_voucher} kWh`}
              detail="Verified solar energy per voucher"
            />
            <Metric
              icon={Banknote}
              label="Voucher price"
              value={`${stroopsToXlm(project.price_per_voucher)} XLM`}
              detail="Micropayment checkout add-on"
              tone="blue"
            />
            <Metric
              icon={Leaf}
              label="Vouchers sold"
              value={project.vouchers_sold.toLocaleString()}
              detail="Customer-funded claims"
              tone="green"
            />
            <Metric
              icon={BadgeCheck}
              label="Verified units"
              value={project.verified_units.toLocaleString()}
              detail="Report-backed impact"
              tone="gold"
            />
          </div>

          <div className="vault-ledger">
            <div className="ledger-header">
              <div>
                <span className="eyebrow">Smart contract vault</span>
                <h3>Escrowed funds release only after verification</h3>
              </div>
              <strong>{stroopsToXlm(vaultBalance)} XLM in vault</strong>
            </div>
            <div className="ledger-strip">
              <div>
                <span>Total funded</span>
                <strong>{stroopsToXlm(project.funded_amount)} XLM</strong>
              </div>
              <div>
                <span>Withdrawn</span>
                <strong>{stroopsToXlm(project.withdrawn_amount)} XLM</strong>
              </div>
              <div>
                <span>Verification report</span>
                <strong>{project.report_hash || "Pending"}</strong>
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
            <label>
              Voucher quantity
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
            <div className="quote-grid">
              <span>Voucher price</span>
              <strong>{stroopsToXlm(project.price_per_voucher)} XLM</strong>
              <span>Impact funded</span>
              <strong>
                {preview.impact.toLocaleString()} {project.impact_unit}
              </strong>
              <span>Escrow status</span>
              <strong>{configured ? "Vault ready" : "Demo preview"}</strong>
            </div>
            <button
              className="button button-primary button-full"
              disabled={!configured || busy === "buy"}
              onClick={() => runTx("buy", () => buyVoucher(address, PROJECT_ID, Number(quantity)))}
            >
              <ShoppingCart size={17} aria-hidden="true" />
              Buy Voucher
            </button>
          </section>

          <ImpactReceipt
            address={address}
            project={project}
            preview={preview}
            quantity={Number(quantity || 0)}
            lastTx={lastTx}
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
              <span>Retired impact</span>
              <strong>{holding.retired_units} units</strong>
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
          <strong>Vietnam cafe checkout</strong>
          <p>Designed for retailers, campus events, and SMEs that need proof-backed green campaigns.</p>
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
