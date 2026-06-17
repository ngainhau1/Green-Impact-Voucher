# APAC Stellar Hackathon Submission Draft

## Project Title

Green Impact Voucher

## Tagline

Green checkout finance, verified on Stellar: customer micro-payments become verified local impact vouchers with smart contract vault custody.

## One-Sentence Summary

Green Impact Voucher lets cafes, events, retailers, and SMEs attach verified environmental impact to checkout payments, while a Soroban vault holds funds until the impact is verified.

## Problem

Local merchants and SMEs want customers to support green campaigns at checkout, but current donation flows rely on QR transfers, donation boxes, or private reports. Customers cannot verify whether their money reached the project, merchants cannot prove impact publicly, and project owners lack a low-cost way to publish auditable delivery proof before receiving funds.

## Solution

Green Impact Voucher creates a transparent green checkout flow:

1. A merchant or project owner launches an impact campaign.
2. A customer buys a small voucher during checkout.
3. The payment goes into a Soroban smart contract vault.
4. The customer receives an impact receipt with campaign, impact units, paid amount, and transaction proof.
5. The project owner or admin verifies delivered impact with a report hash.
6. The customer retires the voucher as public proof.
7. The project owner withdraws funds only after verification.

## Target Users

- Customers who want small, transparent green contributions.
- Cafes, retailers, events, and SMEs that want a credible green checkout campaign.
- Local green projects that need community funding.
- Organizations that need public ESG or CSR proof.

## Why Stellar

Stellar is well-suited for this use case because small customer contributions require low fees, fast settlement, and real asset movement. The project uses the native XLM Stellar Asset Contract on Testnet and Soroban contract logic for vault custody, verification, events, and transparent proof.

## Stellar/Soroban Usage

- Native XLM SAC payment token on Testnet.
- Soroban smart contract vault receives payment during `buy_voucher`.
- `verify_project` stores a report hash and verified impact units.
- `retire_voucher` creates a final proof state for the customer.
- `withdraw_funds` releases funds only after verification.
- Events are emitted for project creation, purchase, verification, retirement, withdrawal, and admin transfer.

## Demo Flow

1. Open the React dashboard.
2. Show the three product modes: Customer Checkout, Merchant Console, Verifier Vault.
3. Buy a Solar Classroom Voucher.
4. Show the Impact Receipt.
5. Open the Stellar Expert transaction proof.
6. Verify impact with a report hash.
7. Retire voucher ID `1`.
8. Withdraw verified funds from the vault.

## Testnet Proof

- Contract ID: `CDIGDTCOY3J6YHVXXBKK7NWLSLYHYV3OAPMSWHQJTPKQ4QBY4QVV4GL3`
- Contract Explorer: <https://stellar.expert/explorer/testnet/contract/CDIGDTCOY3J6YHVXXBKK7NWLSLYHYV3OAPMSWHQJTPKQ4QBY4QVV4GL3>
- WASM upload: <https://stellar.expert/explorer/testnet/tx/1e72f62f3f2e67ddce22b49be1fdcbcfa8bba19f064cf8956f023b9d86b404ea>
- Deploy: <https://stellar.expert/explorer/testnet/tx/21141e51c1945035d66bbebd22da66aff369ba842cd3e3469d6564303c118c84>
- Create project: <https://stellar.expert/explorer/testnet/tx/d3280934101aa3e21da70c0885d3c23aa33a24864be3ab4e3f1ce496188adaa9>
- Buy voucher: <https://stellar.expert/explorer/testnet/tx/472998d13bce42752cd682ae63b074f21348c6ffec719a23de79348398f51702>
- Verify project: <https://stellar.expert/explorer/testnet/tx/bfe5b3cfa4a2b5e52d236ab20c801cefee685880dfc5a837f2fc24927a65952c>
- Retire voucher: <https://stellar.expert/explorer/testnet/tx/8f2a42d3a58291cf19d1b3b39d536fc2e490a3a87c24d5d8ac0163aa0420744b>
- Withdraw funds: <https://stellar.expert/explorer/testnet/tx/cea81936292151d40393a9eba007f71e24408e826fdf96ff4363c811094ca3b5>

## Technical Quality

- Smart contract: Rust + Soroban SDK v26.
- Frontend: React + Vite + Freighter.
- Tests: 12 Soroban tests passing.
- WASM size: 13,403 bytes.
- Frontend checks: build, lint, and audit pass.
- No private keys or `.env` files are committed.

## Differentiation

The project connects real customer-facing payment behavior to verifiable local impact. It is not only an impact tracker: it includes payment, custody, verification, retirement, and conditional payout in a single Stellar workflow.

## Roadmap

- Add merchant campaign creation templates.
- Add local stable asset or anchor-issued asset support.
- Add off-chain metadata indexing for project reports and receipts.
- Add receipt sharing for customers.
- Add partner integrations for cafes, campuses, and events in Vietnam/APAC.
