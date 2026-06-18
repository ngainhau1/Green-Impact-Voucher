# CLAUDE.md

## Project Context

Green Impact Voucher is a green checkout finance application on Stellar. It belongs in the **Payment & Consumer Applications** hackathon track. Treat it as a merchant checkout and consumer payment product with escrow, verification, receipts, and future refund protection.

The core narrative:

> Merchant checkout payments become verified impact vouchers. Customer funds are escrowed in a Soroban smart contract, verified impact unlocks payout, and customers receive public proof.

Final goal: build a complete, production-shaped financial application. Demo materials are only evidence for judges; do not treat this repo as a lightweight one-off demo.

Locked big UI decision: use **A+C**, meaning **Satellite Proof + Solar Classroom Journey**. Future frontend work should blend nature-rich storytelling with financial proof: satellite-style impact evidence, solar classroom imagery, QR checkout, escrow status, verification timeline, and receipt-grade on-chain proof. Do not reopen this direction unless the user explicitly changes it.

## Current Stack

- Contract: Rust/Soroban in `contracts/impact_voucher`.
- Backend: Node.js/Fastify product API in `backend`.
- Frontend: React/Vite/CSS in `frontend`.
- Wallet: Freighter.
- Network: Stellar Testnet.
- Payment token: native XLM Stellar Asset Contract.
- Current contract: `CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J`.

## Work Priorities

Prefer changes that improve:

1. QR/link checkout and merchant campaign workflow.
2. Public impact receipt and Stellar transaction proof.
3. Escrow, verification, withdrawal, and refund-if-not-verified logic.
4. Proof timeline for Create Campaign, Buy Voucher, Verify Impact, Retire Voucher, Withdraw Funds, and Refund.
5. Hosted demo, pitch deck, demo video, and final submission quality.
6. Complete product flow across merchant onboarding, customer checkout, verifier operations, receipt proof, refund path, analytics, and documentation.
7. Big UI work that implements the locked A+C direction without weakening the financial application narrative.

## Required Checks

Before completing substantial changes, run:

```powershell
.\scripts\verify.ps1
```

Focused commands:

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

## Safety And Repo Rules

- Never commit, amend, tag, push, or create a pull request unless the user explicitly asks for that exact git action in the current conversation.
- After making file changes, report changed files and verification results, then wait for the user to request commit/push.
- Never commit secrets or `.env` files.
- Keep `target/`, `frontend/dist/`, and `frontend/node_modules/` ignored.
- Do not redeploy the contract without updating README, frontend environment examples, and Testnet proof links.
- Keep all primary public content in English.
- Keep Vietnamese documents only as secondary references.
- Do not use placeholder or stock image URLs.
- Do not frame or implement the work as a simple demo only; keep moving it toward a complete, usable financial product.
- Do not replace the locked A+C visual direction with another theme unless the user explicitly requests a new direction.

## UI Direction

The product should feel like a trustworthy nature-fintech checkout tool using the locked **A+C: Satellite Proof + Solar Classroom Journey** direction:

- Clear proof of network, contract, payment asset, and report hash.
- Nature imagery must explain the payment-to-impact journey, not serve as generic decoration.
- Satellite/proof visuals should reinforce verification, location, report hashes, and public receipts.
- Solar classroom visuals should make the customer impact concrete and emotionally memorable.
- Ledger-style vault balances.
- Receipt-grade customer proof.
- Merchant and verifier controls that look operational, not decorative.
- Motion should support the proof journey: parallax nature layers, satellite scan/proof states, QR proof pulse, receipt reveal, and timeline transitions.
- Provide reduced-motion behavior and keep every transaction action usable without animation.
- Responsive layout with no text overflow on desktop or mobile.

## Agent Registry

Use `.agents/` for shared project goals and acceptance criteria. Use `.claude/agents/` for Claude Code subagents. Use `.codex/agents/` for Codex custom agents.
