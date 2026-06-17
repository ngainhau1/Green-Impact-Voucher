# Phase Execution Plan

## Goal

Build Green Impact Voucher as a complete, production-shaped financial application. The hackathon demo is only the proof surface; the repo should move toward a real merchant checkout product with Stellar escrow, verification, receipts, refund protection, backend product services, hosted deployment, and submission assets.

## Phase 0 - Alignment And Baseline

Purpose: lock the product thesis, verify the current repo state, and protect against uncontrolled scope drift.

Deliverables:

- Confirm the primary track is `Payment & Consumer Applications`.
- Keep public-facing product language English-first.
- Keep the final goal framed as a complete financial app, not a simple demo.
- Keep the no-autonomous-git rule active: no commit, amend, tag, push, or PR unless explicitly requested.
- Confirm current Testnet contract ID, Stellar Expert links, README proof, frontend env examples, and screenshots are not stale.

Validation:

- `git status --short`
- `.\scripts\verify.ps1`
- Manual README/proof check.

Exit criteria:

- Repo instructions, roadmap, and acceptance criteria agree on the same product thesis.
- Any missing proof or stale documentation is listed before feature work starts.

## Phase 1 - Checkout Product Layer

Purpose: make the app feel like a real merchant checkout product before touching the contract.

Deliverables:

- Merchant Console campaign list.
- Campaign detail view with merchant, status, funding, verification, and checkout information.
- QR/link checkout generator per campaign.
- Route-like frontend state for customer checkout by campaign/project ID.
- Customer checkout state that ends in a receipt view after purchase.
- README screenshot refreshed after UI changes.

Implementation areas:

- `frontend/src/App.jsx`
- `frontend/src/index.css`
- `frontend/src/lib/demoData.js`
- `README.md`
- `docs/screenshots/frontend-dashboard.png`

Validation:

- `cd frontend && npm run build`
- `cd frontend && npm run lint`
- `cd frontend && npm audit --omit=dev`
- Desktop and mobile browser QA: no horizontal overflow, no broken buttons, no unclear receipt state.

Exit criteria:

- A judge can understand the merchant-to-customer checkout flow from the first screen.
- The real contract-backed campaign remains available and transaction buttons still work.

## Phase 2 - Backend Product Layer

Purpose: add the product services expected from a complete fintech application without moving custody away from Soroban.

Backend responsibility:

- Store merchant profiles, campaigns, checkout sessions, receipt metadata, and indexed transaction references.
- Generate and resolve checkout sessions.
- Serve public receipt data.
- Sync selected contract events from Stellar/Soroban RPC.
- Provide merchant dashboard data for the frontend.

Non-responsibility:

- Do not hold private keys.
- Do not custody funds.
- Do not override smart contract state.
- Do not mark financial state final unless backed by Stellar/Soroban proof.

Recommended stack:

- Node.js API using Fastify or NestJS.
- PostgreSQL or Supabase for product data.
- Stellar SDK/Soroban RPC for indexing.
- Environment-based config only; no committed secrets.

Suggested endpoints:

- `POST /api/checkout-sessions`
- `GET /api/checkout-sessions/:id`
- `GET /api/campaigns`
- `GET /api/campaigns/:id`
- `GET /api/receipts/:voucherId`
- `GET /api/merchant/dashboard`
- `POST /api/indexer/sync`

Validation:

- Backend unit tests for session/receipt/indexing logic.
- API smoke test.
- Frontend can load campaign/session/receipt data from backend in local mode.
- Secrets remain ignored.

Exit criteria:

- QR/link checkout can be backed by a real checkout session.
- Public receipt data can be served by API while final proof remains on Stellar.

## Phase 3 - Refund-Protected Escrow

Purpose: make the contract stronger for consumer protection and judging credibility.

Deliverables:

- Project deadline or verification deadline added to contract state.
- Refund eligibility for unverified campaigns after deadline.
- `refund_voucher(owner, voucher_id)` or equivalent.
- Refund-related events.
- Tests for refund before deadline, refund after verification, double refund, invalid owner refund, and withdrawal accounting after refund.
- Redeploy Testnet only after tests pass.
- README, frontend env examples, Stellar Expert links, and proof docs updated after redeploy.

Implementation areas:

- `contracts/impact_voucher/src/lib.rs`
- `contracts/impact_voucher/src/test.rs`
- `frontend/src/lib/contract.js`
- `frontend/.env.example`
- `README.md`
- `docs/`

Validation:

- `cargo test`
- `stellar contract build --package impact-voucher`
- `.\scripts\verify.ps1`
- Manual Testnet flow: create project, buy voucher, verify, retire, withdraw, refund where applicable.

Exit criteria:

- Consumer refund protection is real contract logic, not UI copy.
- Redeployed contract proof is fully documented.

## Phase 4 - Public Proof Timeline And Hosted Product

Purpose: make the financial proof easy to inspect without requiring judges to read code.

Deliverables:

- Public receipt page/state with buyer, campaign, paid amount, impact, voucher ID, transaction hash, verification/refund status, and Stellar Expert link.
- Proof timeline: Create Campaign, Buy Voucher, Verify Impact, Retire Voucher, Withdraw Funds, Refund.
- Rich demo seed data for merchant, customer, verifier, report hash, and receipt history.
- Hosted frontend on Vercel or Netlify.
- README updated with hosted URL and fresh screenshot.

Validation:

- Hosted app loads without local-only assumptions.
- Receipt proof links resolve.
- Mobile public receipt view has no overflow.
- README setup and hosted/demo paths match current behavior.

Exit criteria:

- A judge can open a hosted URL and independently inspect a full payment-to-proof story.

## Phase 5 - Merchant Analytics And Operational Polish

Purpose: make the app feel like a working merchant finance tool, not only a transaction form.

Deliverables:

- Merchant dashboard metrics: vouchers sold, escrow balance, verified impact, refunded amount, payout-ready amount, conversion rate.
- Verifier queue with verification status and report hash.
- Customer receipt history.
- Error states and empty states.
- Copy polish for real APAC merchant use cases.

Validation:

- Frontend build/lint/audit.
- Browser QA for dashboard density and readability.
- No generic eco-dashboard visual language.

Exit criteria:

- Merchant, customer, and verifier each have a clear reason to use the product repeatedly.

## Phase 6 - Final Submission Package

Purpose: turn the completed product story into a judging-ready package.

Deliverables:

- English Canva pitch deck.
- 2-3 minute demo video.
- Final README with screenshot, hosted URL, contract ID, Stellar Expert proof, setup, test commands, and submission answers.
- Final submission checklist.
- Security/secret scan.

Validation:

- `.\scripts\verify.ps1`
- `npm audit --omit=dev`
- Manual demo rehearsal using hosted frontend, Freighter, and Stellar Expert.
- Submission form answers match product and repo.

Exit criteria:

- The project can be judged as a complete fintech application with real Stellar integration and a clear go-to-market path.

## Immediate Execution Order

1. Execute Phase 1 first because it improves judge comprehension without requiring a contract redeploy.
2. Add Phase 2 backend only after the frontend checkout flow is clear.
3. Implement Phase 3 refund logic after backend/session requirements are clear enough to avoid contract churn.
4. Complete Phase 4 hosted proof before final pitch/video work.
5. Use Phase 5 only after the core payment, receipt, refund, and hosted proof flows are stable.
6. Finish Phase 6 last, after all links, screenshots, contract IDs, and demo paths are current.
