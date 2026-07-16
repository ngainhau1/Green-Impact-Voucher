import { BadgeCheck, Banknote, ReceiptText, RotateCcw, Satellite, ShoppingCart } from "lucide-react";
import { journeySteps, makeProofLink, makeReceiptLink } from "../../lib/viewModel";
import { stroopsToXlm } from "../../lib/stellar";

const icons = [ShoppingCart, Banknote, Satellite, ReceiptText];

export function SolarJourney({ campaign, displayProject, refundRiskAmount, vaultBalance }) {
  return (
    <section className="solar-journey" aria-label="Solar classroom journey">
      <div className="journey-copy">
        <span className="eyebrow">Solar Classroom Journey</span>
        <h2>From cafe checkout to verified classroom energy</h2>
        <p>
          The interface now follows a concrete financial story: a merchant checkout funds a local solar
          classroom, Stellar escrow protects the payment, verification publishes proof, and the receipt can
          be shared by the customer.
        </p>
        <div className="journey-actions">
          <a className="button button-primary" href={makeProofLink(1)}>
            <BadgeCheck size={17} aria-hidden="true" />
            Verified Proof
          </a>
          <a className="button button-ghost" href={makeProofLink(2)}>
            <RotateCcw size={17} aria-hidden="true" />
            Refund Proof
          </a>
          <a className="button button-ghost" href={makeReceiptLink("voucher-1")}>
            <ReceiptText size={17} aria-hidden="true" />
            Receipt
          </a>
        </div>
      </div>

      <div className="journey-visual-grid">
        <div className="journey-image-panel">
          <img src="/assets/visuals/solar-classroom-scene.svg" alt="" />
          <div className="solar-shimmer" aria-hidden="true" />
        </div>
        <div className="journey-ledger-panel">
          <img src="/assets/visuals/vault-grid.svg" alt="" />
          <div className="journey-ledger-copy">
            <span>Vault custody</span>
            <strong>{stroopsToXlm(vaultBalance)} XLM in vault</strong>
            <p>{stroopsToXlm(refundRiskAmount)} XLM refund risk stays visible before settlement.</p>
          </div>
        </div>
      </div>

      <div className="journey-steps">
        {journeySteps.map((step, index) => {
          const Icon = icons[index];
          return (
            <article className="journey-step" key={step.title}>
              <Icon size={18} aria-hidden="true" />
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          );
        })}
      </div>

      <div className="journey-proof-strip">
        <span>{campaign.merchant}</span>
        <strong>{campaign.title}</strong>
        <span>
          {displayProject.unit_per_voucher} {displayProject.impact_unit} per voucher
        </span>
      </div>
    </section>
  );
}
