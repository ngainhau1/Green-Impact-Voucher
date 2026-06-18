# AGENTS.md

## Project Thesis

Green Impact Voucher is a green checkout finance application verified on Stellar. The project is competing in the **Payment & Consumer Applications** track and should read as a user-facing financial product, not a generic environmental dashboard.

North Star: merchants create QR/link checkout campaigns, customers buy small impact vouchers, funds enter a Soroban escrow vault, impact verification unlocks payout, customers receive public receipts, and unverified campaigns can support refund protection.

Final goal: build a complete, production-shaped financial application. Treat hackathon demo assets as proof of the product, not as permission to ship a thin or disposable demo.

Locked big UI decision: use **A+C**, meaning **Satellite Proof + Solar Classroom Journey**. The product should combine nature-rich visual storytelling with financial proof: satellite-style impact evidence, solar classroom imagery, QR checkout, escrow state, verification timeline, and receipt-grade on-chain proof. Do not reopen the big UI direction unless the user explicitly changes this decision.

## Current Product State

- Smart contract: Rust/Soroban in `contracts/impact_voucher`.
- Backend: Node.js/Fastify product API in `backend`.
- Frontend: React/Vite in `frontend`.
- Primary UI language: English.
- Payment token: native XLM Stellar Asset Contract on Stellar Testnet.
- Current contract ID: `CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J`.
- Current frontend surfaces: Customer Checkout, Merchant Console, Verifier Vault, vault ledger, and impact receipt.

## Winning Criteria

Prioritize work that strengthens these judging signals:

- User-facing payment/consumer value at checkout.
- Real Stellar integration with contract and transaction proof.
- Clear merchant value: campaign launch, QR checkout, proof reporting, and verified payout.
- Customer trust: public receipt, transaction proof, refund path when impact is not verified.
- Professional fintech UI and demo readiness.
- End-to-end product completeness: merchant onboarding, customer checkout, escrow, verification, receipt, refund path, analytics, documentation, hosted app, pitch deck, and demo video should tell one complete product story.

## Required Commands

Run the relevant subset while developing, and run the full verification before finishing substantial work:

```powershell
.\scripts\verify.ps1
```

Focused checks:

```powershell
cargo test
stellar contract build --package impact-voucher
cd backend
npm run build
npm test
npm run lint
npm audit --omit=dev
cd frontend
npm run build
npm run lint
npm audit --omit=dev
```

## Non-Negotiables

- Never commit, amend, tag, push, or create a pull request unless the user explicitly asks for that exact git action in the current conversation.
- After making file changes, report changed files and verification results, then wait for the user to request commit/push.
- Do not commit secrets, private keys, `.env`, `target/`, `frontend/dist/`, or `frontend/node_modules`.
- Keep `.env` ignored. Only commit `.env.example`.
- Do not redeploy the contract without updating README, screenshots if needed, frontend `.env.example`, and docs with the new contract ID and transaction proof.
- Do not replace the financial thesis with broad climate storytelling.
- Do not describe, design, or implement the project as a simple demo only. Every feature should move the repo toward a complete, usable financial application.
- Do not replace the locked A+C visual direction with another theme unless the user explicitly requests a new direction.
- Do not add stock images or placeholder image URLs.
- Keep public-facing app, README, pitch deck, and submission content English-first. Vietnamese can remain as a secondary explanation.

## Contract Rules

- Preserve auth on all state-changing user/admin actions.
- Preserve real token movement through Stellar Asset Contract transfers.
- Maintain typed storage keys, custom errors, structured events, and TTL extension.
- Any refund-protection work must cover deadline behavior, double-refund prevention, verified-project refund rejection, and withdrawal accounting after refund.
- Add or update Soroban tests for every contract behavior change.

## Frontend Rules

- Use the locked A+C direction: Satellite Proof + Solar Classroom Journey.
- Keep the app financially credible: nature visuals must support checkout, escrow, verification, receipt, and proof timeline, not become generic environmental decoration.
- Use a premium nature-fintech style: immersive real/local visual assets, satellite proof surfaces, solar impact journey sections, ledger panels, receipt surfaces, and compact metrics.
- Add special effects only when they clarify the product story: parallax nature layers, satellite scan/proof motion, receipt reveal, QR proof pulse, and timeline transitions.
- Respect accessibility and performance: provide reduced-motion behavior, avoid text overflow, and keep core transaction actions usable without motion.
- Keep cards at 8px radius or less.
- Use existing `lucide-react` icons; do not add icon dependencies unless there is a strong reason.
- After UI changes, verify desktop and mobile layouts for no horizontal overflow.
- Refresh `docs/screenshots/frontend-dashboard.png` when the primary UI changes.

## Documentation Rules

- Keep README aligned with the live contract and frontend.
- Keep `docs/pitch-deck-plan.md`, `docs/demo-video-outline.md`, and `docs/final-submission-checklist.md` aligned with the current product narrative.
- Use `.agents/` as the shared planning registry for goals, roadmap, and acceptance criteria.
- Use `.codex/agents/` and `.claude/agents/` for tool-specific custom agents.
