# Pitch Deck Plan - Green Impact Voucher

This is the English-first pitch deck plan for the APAC Stellar Hackathon. It follows the mentor sample deck and the required pitch checklist: Market Overview, Problem, Solution, USP/Competition, GTM plan, and Demo video.

## Core Positioning

**Green Impact Voucher** is a green checkout finance application on Stellar. It helps local merchants turn small customer payments into verified impact vouchers. Customer funds enter a Soroban smart contract vault first, impact is verified with a report hash, and the project owner can withdraw funds only after verification.

The product is not a generic climate dashboard. It is a user-facing financial workflow with payment, escrow, verification, customer receipt, voucher retirement, and conditional payout.

## Specific Problem

Local merchants want to attract customers with credible green campaigns, but checkout donations usually rely on bank-transfer QR codes, private reports, or marketing claims.

This creates three concrete problems:

- Customers cannot verify where the money went or whether impact was delivered.
- Merchants cannot turn sustainability into a trusted checkout experience.
- Project owners lack a low-cost way to prove delivery before receiving funds.

Chosen problem statement for the deck:

**How can a merchant turn every checkout payment into a verified green voucher that builds customer trust and creates a repeatable transaction loop?**

## Solution

Green Impact Voucher creates a transparent financial flow:

1. A merchant or project owner launches a campaign, such as `Da Nang Solar Classroom`.
2. A customer buys a small green voucher during checkout.
3. The payment enters a Soroban smart contract vault.
4. A verifier records delivered impact with a report hash.
5. The customer receives and retires an on-chain impact receipt.
6. The project owner withdraws verified funds from the vault.

## Slide Structure

### Slide 1 - Cover

**Title:** Green Impact Voucher  
**Tagline:** Green checkout finance, verified on Stellar.

Include:

- Product name and logo.
- Fresh UI screenshot from `docs/screenshots/frontend-dashboard.png`.
- Contract ID short form and Stellar Testnet label.
- One-line positioning: `Checkout payments become verified impact vouchers with escrow and on-chain receipts.`

### Slide 2 - Market Overview

**Main message:** APAC merchants need a checkout-native way to make green campaigns trusted, measurable, and repeatable.

Include:

- Initial wedge: cafes, campus events, retailers, and SMEs in Vietnam/APAC.
- Customer segment: merchants that already use digital payment, loyalty, or event checkout flows.
- Market logic: green checkout + loyalty + proof-backed reporting.

Use conservative labels instead of inflated market numbers:

- TAM: APAC retail and consumer green spending.
- SAM: merchants with digital checkout and loyalty workflows.
- SOM: 3-5 pilot merchants in Vietnam.

### Slide 3 - Problem

**Main message:** Green marketing breaks down at checkout because customers do not receive proof.

Include:

- QR donations and private ESG reports do not prove delivery.
- Customers cannot see whether funds reached the project.
- Merchants lose a chance to create a trusted post-purchase receipt.
- Small contributions are hard to audit in centralized systems.

Use one concrete example:

`A cafe customer adds a 0.10 XLM green voucher, but without on-chain proof, the customer only sees a promise.`

### Slide 4 - Solution

**Main message:** Green Impact Voucher turns checkout into an escrowed, verified financial workflow.

Include:

- Customer buys voucher.
- Contract vault receives funds.
- Verifier records report hash and verified units.
- Customer retires voucher as proof.
- Owner withdraws only after verification.

Visual:

`Checkout -> Vault -> Verification -> Impact Receipt`

### Slide 5 - Product Demo Flow

**Main message:** The demo shows a complete Stellar transaction lifecycle, not just a mock UI.

Show:

- Customer Checkout: voucher quantity, price, impact funded, Buy Voucher.
- Merchant Console: campaign status, vault balance, sold vouchers.
- Verifier Vault: verified units, report hash, withdraw verified funds.
- Stellar Expert: contract and transaction proof.

### Slide 6 - Why Stellar/Soroban

**Main message:** Stellar is a strong fit because this is a small-payment finance workflow with public proof.

Map requirements to Stellar:

- Micropayments -> low fees.
- Checkout speed -> fast settlement.
- Trust -> public ledger.
- Conditional payout -> Soroban smart contract.
- Judging proof -> Stellar Expert links.

### Slide 7 - Key Features

**Main message:** The MVP includes real financial mechanics and verification logic.

Include:

- Token transfer into contract vault during `buy_voucher`.
- Verified release through `verify_project` and `withdraw_funds`.
- Voucher retirement with holder state.
- Admin transfer, custom errors, structured events, and TTL bumping.
- React UI for Customer Checkout, Merchant Console, and Verifier Vault.
- README includes Testnet proof and screenshots.

### Slide 8 - Competitive Landscape / USP

**Main message:** The USP is checkout-native impact finance with escrow and customer receipts.

Comparison:

| Criteria | Donation Form | Loyalty Points | Carbon Marketplace | Green Impact Voucher |
| --- | --- | --- | --- | --- |
| Checkout-native | Sometimes | Yes | Usually no | Yes |
| On-chain proof | Usually no | No | Sometimes | Yes |
| Escrow before verification | No | No | Platform-specific | Yes |
| Micropayment friendly | Medium | High | Low | High |
| Merchant-friendly | Medium | High | Low | High |

USP:

- Tied directly to merchant checkout.
- Funds cannot be withdrawn before verification.
- Customers receive receipt-grade on-chain proof.

### Slide 9 - GTM Plan

**Main message:** Start with local merchants, then expand into a green checkout toolkit.

Phase 1 - Pilot:

- 3-5 cafes, campus events, or SME retailers in Vietnam.
- One simple green campaign per merchant.
- Voucher price around 0.1-1 USD equivalent.
- KPIs: vouchers sold, repeat customers, receipt shares, verified payout volume.

Phase 2 - Merchant Toolkit:

- QR checkout link.
- Campaign dashboard.
- Exportable proof report.
- Verifier workflow.

Phase 3 - Ecosystem:

- Wallet integrations.
- Project marketplace.
- API/plugin for merchant POS or e-commerce checkout.

### Slide 10 - Team / Why We Can Build It

**Main message:** The MVP already has smart contract logic, frontend, tests, and Testnet proof.

Include:

- Soroban contract with voucher, vault, verifier, events, and tests.
- React frontend with customer, merchant, and verifier surfaces.
- Quality gates: cargo test, contract build, frontend build, lint, audit.
- Testnet contract and transaction hashes.

### Slide 11 - Demo Video / Contact

**Main message:** Green Impact Voucher is ready for hackathon judging and merchant pilot conversations.

Include:

- Demo video URL.
- Public GitHub repo URL.
- Stellar Expert contract URL.
- Contract ID.
- Team/contact.
- Ask: pilot merchants, verifier partners, and Stellar mentor feedback.

## Demo Video Script

Target duration: 2-3 minutes.

1. 0:00-0:15 - State the problem: merchants need trusted green checkout, not private promises.
2. 0:15-0:35 - Show the app top fold and three roles.
3. 0:35-1:05 - Customer buys a voucher and sees the checkout quote.
4. 1:05-1:30 - Show the receipt and vault ledger.
5. 1:30-1:55 - Verify impact with report hash.
6. 1:55-2:20 - Retire voucher, withdraw verified funds, open Stellar Expert.
7. 2:20-2:45 - Close with the financial application thesis.

## Canva Execution Checklist

- Use the mentor deck as structure, not as content.
- Replace all Vertex text with Green Impact Voucher copy.
- Use English as the main language.
- Use the new fintech UI screenshot.
- Include real Stellar Testnet proof.
- Keep every slide to one main message.
- Avoid broad climate claims without proof.
- Make the financial workflow visible on multiple slides.
