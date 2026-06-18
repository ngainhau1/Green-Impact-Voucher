# Project Brief

## Project Name

Green Impact Voucher

## Track

Payment & Consumer Applications

## Thesis

Green Impact Voucher is a green checkout finance application on Stellar. It lets local merchants turn customer checkout payments into verified impact vouchers with smart contract vault custody, verification, and public receipts.

## Final Product Goal

The goal is a complete, production-shaped financial application, not a simple demo. The app should eventually cover merchant onboarding, campaign setup, QR/link checkout, Stellar escrow, verifier operations, public receipts, refund protection, analytics, hosted deployment, pitch deck, and demo video as one coherent product.

## Locked Big UI Direction

The chosen big UI direction is **A+C: Satellite Proof + Solar Classroom Journey**.

- **A - Satellite Proof:** use satellite-inspired proof surfaces, scan states, location evidence, report hashes, and public verification timelines to make impact inspection feel credible.
- **C - Solar Classroom Journey:** use solar classroom/customer-impact storytelling to make each checkout voucher feel concrete, local, and emotionally memorable.
- This direction must remain a financial application: visual assets and effects should reinforce checkout, escrow, verification, receipt, refund protection, and Stellar proof.
- Do not switch to another UI concept unless the user explicitly changes the decision.

## Problem Statement

Local merchants want to run credible green campaigns at checkout, but current donation flows rely on QR transfers, donation boxes, or private reports. Customers cannot verify where their money went or whether the promised impact was delivered. Merchants also lack a trusted way to turn sustainability into a repeatable customer transaction and public proof.

## Proposed Solution

When a customer buys a voucher, the payment is held in a Soroban smart contract vault. A verifier records delivered impact with a report hash, the customer receives an on-chain impact receipt, and the project owner can withdraw funds only after verification. The roadmap adds QR checkout, public receipt pages, proof timeline, and refund protection for unverified campaigns.

The frontend should present that solution through the A+C journey: a customer starts from a merchant QR/link checkout, sees local solar-classroom impact, pays into escrow, follows satellite-style verification proof, and receives a receipt that links back to Stellar evidence.

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
- Backend product API for campaigns, checkout sessions, receipt metadata, merchant dashboard metrics, and indexed transaction references; it does not custody funds or sign transactions.

## Current Testnet Proof

- Contract ID: `CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J`
- Payment token: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- Buy voucher tx: `ce18365fcaa1ab024be0f417175713c677afb98321209dce9c4d741e9f897a96`
- Verify project tx: `6797048bcd49d9d96b05c3fbf5b2b4917edc4f29b9e11e006952ffcb8f77547d`
- Retire voucher tx: `a4735c7a6f90cf21340dbe8c7b885c36308008f097f926bf0f768e9197b95f06`
- Withdraw funds tx: `c8062efdd8e0512f88bcf2908bef4f085d2b4d5175202f8d8b5b304c4b55e984`
- Refund voucher tx: `7b44332277ce3be6b4d3167cf67f323b2956cb22593108ab4726b2537c28f9bf`

## Judging Criteria To Optimize

- Clear consumer payment flow.
- Real Stellar/Soroban usage, not a mock.
- Merchant value and local economy relevance.
- Customer trust through receipt-grade proof.
- Strong demo, README, pitch deck, and Testnet evidence.
- Complete product narrative instead of a narrow proof-of-concept demo.
- Premium A+C UI direction that makes the product memorable without losing transaction clarity.
