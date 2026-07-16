import { Building2, ReceiptText, ShieldCheck } from "lucide-react";

export function MarketContext() {
  return (
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
  );
}
