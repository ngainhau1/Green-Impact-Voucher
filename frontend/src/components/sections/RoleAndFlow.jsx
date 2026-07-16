import { BadgeCheck, Banknote, ClipboardCheck, ReceiptText, ShoppingCart, Store, UserRound } from "lucide-react";
import { financeFlow, flowTabs } from "../../lib/viewModel";
import { FlowStep, RoleCard } from "../ui/Primitives";

const roleIcons = {
  customer: UserRound,
  merchant: Store,
  verifier: ClipboardCheck,
};

const flowIcons = [ShoppingCart, Banknote, BadgeCheck, ReceiptText];

export function RoleAndFlow({ activeFlow, onSelectFlow }) {
  return (
    <>
      <section className="role-switcher" aria-label="Product roles">
        {flowTabs.map((flow) => (
          <RoleCard
            key={flow.id}
            flow={flow}
            icon={roleIcons[flow.id]}
            active={activeFlow === flow.id}
            onClick={() => onSelectFlow(flow.id)}
          />
        ))}
      </section>

      <section className="flow-rail" aria-label="Financial flow">
        {financeFlow.map((item, index) => (
          <FlowStep key={item.label} item={item} index={index} icon={flowIcons[index]} />
        ))}
      </section>
    </>
  );
}
