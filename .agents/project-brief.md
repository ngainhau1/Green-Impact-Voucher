# Project Brief

## Project Name

Green Impact Voucher

## Track

Payment & Consumer Applications

## Thesis

Green Impact Voucher is a green checkout finance application on Stellar. It lets local merchants turn customer checkout payments into verified impact vouchers with smart contract vault custody, verification, and public receipts.

## Final Product Goal

The goal is a complete, production-shaped financial application, not a simple demo. The app should eventually cover merchant onboarding, campaign setup, QR/link checkout, Stellar escrow, verifier operations, public receipts, refund protection, analytics, hosted deployment, pitch deck, and demo video as one coherent product.

## Problem Statement

Local merchants want to run credible green campaigns at checkout, but current donation flows rely on QR transfers, donation boxes, or private reports. Customers cannot verify where their money went or whether the promised impact was delivered. Merchants also lack a trusted way to turn sustainability into a repeatable customer transaction and public proof.

## Proposed Solution

When a customer buys a voucher, the payment is held in a Soroban smart contract vault. A verifier records delivered impact with a report hash, the customer receives an on-chain impact receipt, and the project owner can withdraw funds only after verification. The roadmap adds QR checkout, public receipt pages, proof timeline, and refund protection for unverified campaigns.

## Target Users

- Local merchants, cafes, events, and SME retailers in Vietnam/APAC.
- Customers who want proof that small green payments produce real impact.
- Green project owners who need community funding with transparent payout conditions.
- Verifiers/admins who confirm delivered impact before funds leave escrow.

## Expected Stellar Integration

- Stellar Testnet for demo and proof.
- Soroban smart contract for project creation, voucher purchase, escrow custody, verification, voucher retirement, and withdrawal.
- Native XLM Stellar Asset Contract as the current payment token.
- Freighter wallet for customer/admin signing.
- Stellar Expert links for contract and transaction proof.

## Current Testnet Proof

- Contract ID: `CDIGDTCOY3J6YHVXXBKK7NWLSLYHYV3OAPMSWHQJTPKQ4QBY4QVV4GL3`
- Payment token: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- Buy voucher tx: `472998d13bce42752cd682ae63b074f21348c6ffec719a23de79348398f51702`
- Verify project tx: `bfe5b3cfa4a2b5e52d236ab20c801cefee685880dfc5a837f2fc24927a65952c`
- Retire voucher tx: `8f2a42d3a58291cf19d1b3b39d536fc2e490a3a87c24d5d8ac0163aa0420744b`
- Withdraw funds tx: `cea81936292151d40393a9eba007f71e24408e826fdf96ff4363c811094ca3b5`

## Judging Criteria To Optimize

- Clear consumer payment flow.
- Real Stellar/Soroban usage, not a mock.
- Merchant value and local economy relevance.
- Customer trust through receipt-grade proof.
- Strong demo, README, pitch deck, and Testnet evidence.
- Complete product narrative instead of a narrow proof-of-concept demo.
