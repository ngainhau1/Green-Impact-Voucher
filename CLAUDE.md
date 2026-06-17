# CLAUDE.md

## Project Context

Green Impact Voucher is a green checkout finance application on Stellar. It belongs in the **Payment & Consumer Applications** hackathon track. Treat it as a merchant checkout and consumer payment product with escrow, verification, receipts, and future refund protection.

The core narrative:

> Merchant checkout payments become verified impact vouchers. Customer funds are escrowed in a Soroban smart contract, verified impact unlocks payout, and customers receive public proof.

## Current Stack

- Contract: Rust/Soroban in `contracts/impact_voucher`.
- Frontend: React/Vite/CSS in `frontend`.
- Wallet: Freighter.
- Network: Stellar Testnet.
- Payment token: native XLM Stellar Asset Contract.
- Current contract: `CDIGDTCOY3J6YHVXXBKK7NWLSLYHYV3OAPMSWHQJTPKQ4QVV4GL3`.

## Work Priorities

Prefer changes that improve:

1. QR/link checkout and merchant campaign workflow.
2. Public impact receipt and Stellar transaction proof.
3. Escrow, verification, withdrawal, and refund-if-not-verified logic.
4. Proof timeline for Create Campaign, Buy Voucher, Verify Impact, Retire Voucher, Withdraw Funds, and Refund.
5. Hosted demo, pitch deck, demo video, and final submission quality.

## Required Checks

Before completing substantial changes, run:

```powershell
.\scripts\verify.ps1
```

Focused commands:

```powershell
cargo test
stellar contract build --package impact-voucher
cd frontend
npm run build
npm run lint
npm audit --omit=dev
```

## Safety And Repo Rules

- Never commit secrets or `.env` files.
- Keep `target/`, `frontend/dist/`, and `frontend/node_modules/` ignored.
- Do not redeploy the contract without updating README, frontend environment examples, and Testnet proof links.
- Keep all primary public content in English.
- Keep Vietnamese documents only as secondary references.
- Do not use placeholder or stock image URLs.

## UI Direction

The product should feel like a trustworthy fintech checkout tool:

- Clear proof of network, contract, payment asset, and report hash.
- Ledger-style vault balances.
- Receipt-grade customer proof.
- Merchant and verifier controls that look operational, not decorative.
- Responsive layout with no text overflow on desktop or mobile.

## Agent Registry

Use `.agents/` for shared project goals and acceptance criteria. Use `.claude/agents/` for Claude Code subagents. Use `.codex/agents/` for Codex custom agents.
