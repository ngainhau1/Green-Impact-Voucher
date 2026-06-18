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
8. If the campaign is not verified after its deadline, the customer can claim a refund.

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
- `refund_voucher` returns funds for unverified vouchers after the verification deadline.
- `withdraw_funds` releases funds only after verification.
- Events are emitted for project creation, purchase, verification, retirement, refund, withdrawal, and admin transfer.

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

- Contract ID: `CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J`
- Contract Explorer: <https://stellar.expert/explorer/testnet/contract/CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J>
- WASM upload: <https://stellar.expert/explorer/testnet/tx/9171b2e5efa4139cff02c248a16299f3e403df4a0ef7a6fac681b3e3fd5eef02>
- Deploy: <https://stellar.expert/explorer/testnet/tx/7f64a44e66e7c2048ca8be074e3f2f12f3d4cc7ca1e0e3c8abb97d9775bc1cda>
- Create project: <https://stellar.expert/explorer/testnet/tx/355f56f9f492a4e33ec90260ddf6347b8f6a25176b7618b72634344487d511ab>
- Buy voucher: <https://stellar.expert/explorer/testnet/tx/ce18365fcaa1ab024be0f417175713c677afb98321209dce9c4d741e9f897a96>
- Verify project: <https://stellar.expert/explorer/testnet/tx/6797048bcd49d9d96b05c3fbf5b2b4917edc4f29b9e11e006952ffcb8f77547d>
- Retire voucher: <https://stellar.expert/explorer/testnet/tx/a4735c7a6f90cf21340dbe8c7b885c36308008f097f926bf0f768e9197b95f06>
- Withdraw funds: <https://stellar.expert/explorer/testnet/tx/c8062efdd8e0512f88bcf2908bef4f085d2b4d5175202f8d8b5b304c4b55e984>
- Refund voucher: <https://stellar.expert/explorer/testnet/tx/7b44332277ce3be6b4d3167cf67f323b2956cb22593108ab4726b2537c28f9bf>

## Technical Quality

- Smart contract: Rust + Soroban SDK v26.
- Frontend: React + Vite + Freighter.
- Tests: 20 Soroban tests passing.
- WASM size: 15,670 bytes.
- Frontend checks: build, lint, and audit pass.
- No private keys or `.env` files are committed.

## Differentiation

The project connects real customer-facing payment behavior to verifiable local impact. It is not only an impact tracker: it includes payment, custody, verification, retirement, refund protection, and conditional payout in a single Stellar workflow.

## Roadmap

- Add merchant campaign creation templates.
- Add local stable asset or anchor-issued asset support.
- Add off-chain metadata indexing for project reports and receipts.
- Add receipt sharing for customers.
- Add partner integrations for cafes, campuses, and events in Vietnam/APAC.
