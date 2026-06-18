# Green Impact Voucher

Green Impact Voucher is a green checkout finance dApp verified on Stellar. It lets local merchants, events, and SMEs turn small customer payments into verified environmental impact vouchers with smart contract vault custody, report-gated release, and receipt-grade customer proof.

## UI Preview

The React frontend presents the product as a fintech checkout workflow backed by a product API: Customer Checkout, Merchant Console campaign list, scannable QR checkout sessions, Verifier Vault, smart contract proof, escrowed vault balance, public receipt sharing, and campaign proof timelines.

![Green Impact Voucher fintech checkout UI](docs/screenshots/frontend-dashboard.png)

## Specific Problem

Coffee shops, campus events, retailers, and SMEs want customers to support local green campaigns at checkout, but the current options are usually donation boxes, bank-transfer QR codes, or private ESG reports. Customers cannot verify whether their money reached the project, merchants cannot prove impact to their community, and project owners lack a low-cost way to publish auditable delivery proof.

## Solution

Green Impact Voucher turns each checkout contribution into an on-chain impact voucher. Customer funds enter a Soroban smart contract vault first, impact is verified with a report hash, the customer receives a receipt-like voucher, the project owner can withdraw funds only after verification, and customers can claim refunds when impact is not verified after the campaign deadline.

## Financial Application Positioning

This is not only a climate dashboard. It is a user-facing financial application for verified local impact funding:

- Customer: adds a small green voucher payment during checkout.
- Merchant: runs a local green campaign and uses on-chain proof for ESG/community reporting.
- Project owner: receives funds through a conditional vault release instead of direct unverified payout.
- Verifier/admin: confirms delivered impact before funds are unlocked.

Example transaction: a customer at a Da Nang cafe pays `0.10 XLM` for a `Solar Classroom Voucher`, funding `10 kWh of verified solar energy`. The payment goes to the contract vault, the voucher is recorded on-chain, and payout happens only after the solar impact report is verified.

## Why Stellar

Stellar makes this use case practical because fees are low enough for micro-contributions, settlement is fast, native assets are available through Stellar Asset Contracts, and Soroban contracts can store transparent proof without a centralized backend.

## Key Features

- Real payment flow using the native XLM Stellar Asset Contract on Testnet.
- Backend product API for merchant campaigns, checkout sessions, public receipts, proof bundles, dashboard metrics, and indexed transaction references.
- Contract vault custody: voucher purchases transfer payment into the contract.
- Verified release: project owner can withdraw funds only after impact is verified.
- Refund protection: unverified vouchers can be refunded after the verification deadline.
- Customer checkout, merchant console, verifier vault, impact receipt, public receipt, and proof timeline surfaces in the UI.
- Merchant campaign list with scannable QR checkout links and route-like customer checkout state.
- Shareable proof routes: `#/receipt/voucher-1`, `#/proof/1`, and `#/proof/2`.
- Voucher lifecycle: create project, buy voucher, verify impact, retire voucher, withdraw funds.
- Typed Soroban storage keys, typed custom errors, TTL extension, and structured events.
- Freighter-connected React dashboard with Stellar Expert transaction links.
- README and demo script include Testnet proof for judging.

## User-Facing Transaction Flow

1. Merchant or project owner launches a campaign such as `Da Nang Solar Classroom`.
2. Merchant shares a QR/link checkout for the campaign.
3. Customer buys a green checkout voucher worth `0.10 XLM`.
4. The contract transfers payment from the customer into the vault.
5. The UI moves from quote state to receipt state with buyer, campaign, impact units, paid amount, transaction, and verification status.
6. Owner/admin verifies delivered impact with a report hash.
7. Customer opens a public receipt page and campaign proof timeline for receipt-grade proof.
8. Project owner withdraws verified funds from the vault.
9. If a campaign misses its verification deadline, the customer can refund the voucher before payout.

## Contract Detail

- Network: Stellar Testnet
- Contract ID: `CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J`
- Payment token: Native XLM Stellar Asset Contract `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- Admin/deployer: `GDZN36SJ6LJURNUNBW47MQF3DZQDAOGSTZIQVABZLMOVJLN4HZZE5JFK`
- WASM hash: `114b6e5eb1e5969f5755c59be8b7b142ba60d90859dc5e88b06f6052a70c34a0`
- WASM size: `15,670 bytes`
- Contract Explorer: <https://stellar.expert/explorer/testnet/contract/CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J>

![Stellar Expert contract proof](docs/screenshots/stellar-expert-contract.png)

## Stellar Testnet Proof

| Step | Transaction |
| --- | --- |
| WASM upload | <https://stellar.expert/explorer/testnet/tx/9171b2e5efa4139cff02c248a16299f3e403df4a0ef7a6fac681b3e3fd5eef02> |
| Deploy contract | <https://stellar.expert/explorer/testnet/tx/7f64a44e66e7c2048ca8be074e3f2f12f3d4cc7ca1e0e3c8abb97d9775bc1cda> |
| Create project | <https://stellar.expert/explorer/testnet/tx/355f56f9f492a4e33ec90260ddf6347b8f6a25176b7618b72634344487d511ab> |
| Buy voucher | <https://stellar.expert/explorer/testnet/tx/ce18365fcaa1ab024be0f417175713c677afb98321209dce9c4d741e9f897a96> |
| Verify project | <https://stellar.expert/explorer/testnet/tx/6797048bcd49d9d96b05c3fbf5b2b4917edc4f29b9e11e006952ffcb8f77547d> |
| Retire voucher | <https://stellar.expert/explorer/testnet/tx/a4735c7a6f90cf21340dbe8c7b885c36308008f097f926bf0f768e9197b95f06> |
| Withdraw funds | <https://stellar.expert/explorer/testnet/tx/c8062efdd8e0512f88bcf2908bef4f085d2b4d5175202f8d8b5b304c4b55e984> |
| Create refund pilot | <https://stellar.expert/explorer/testnet/tx/ff2b42e1344fca911ce3c23656bc2035982ebdc07ec106f1fa32f6301989173a> |
| Buy refund pilot voucher | <https://stellar.expert/explorer/testnet/tx/daa1342911d26c725ae08101c6e7dea396ed6a5191abdd086c0e42f463c6763e> |
| Refund voucher | <https://stellar.expert/explorer/testnet/tx/7b44332277ce3be6b4d3167cf67f323b2956cb22593108ab4726b2537c28f9bf> |

The `buy_voucher` transaction transfers `2,000,000` stroops from the buyer to the contract. The `withdraw_funds` transaction transfers `1,000,000` stroops from the contract vault back to the project owner after verification. The refund proof transfers `500,000` stroops back to the buyer after an unverified campaign passes its verification deadline.

## Public Proof Routes

Run the frontend locally, then open:

- Public customer receipt: <http://127.0.0.1:5173/#/receipt/voucher-1>
- Verified campaign proof timeline: <http://127.0.0.1:5173/#/proof/1>
- Refund proof timeline: <http://127.0.0.1:5173/#/proof/2>

These pages do not require Freighter. They use the product API proof bundle and fall back to seeded Testnet proof when the backend is unavailable.

## Tech Stack

- Smart contract: Rust, Soroban SDK v26
- Blockchain: Stellar Testnet
- Frontend: React, Vite, vanilla CSS
- Backend: Node.js, Fastify, Zod validation, local JSON storage
- Wallet: Freighter via `@stellar/freighter-api`
- SDK: `@stellar/stellar-sdk`

## Repository Structure

```text
GreenImpactVoucher/
|-- contracts/
|   `-- impact_voucher/
|       |-- Cargo.toml
|       `-- src/
|           |-- lib.rs
|           `-- test.rs
|-- frontend/
|   |-- public/
|   `-- src/
|-- backend/
|   |-- src/
|   |-- test/
|   `-- .env.example
|-- docs/
|   |-- screenshots/
|   `-- demo-script.md
|-- scripts/
|   `-- verify.ps1
|-- Cargo.toml
|-- Makefile
|-- README.md
`-- .gitignore
```

## Smart Contract Functions

| Function | Purpose |
| --- | --- |
| `__constructor(admin)` | Stores the project admin at deployment time. |
| `admin()` | Reads the current admin address. |
| `set_admin(current_admin, new_admin)` | Transfers admin control and emits `AdminChanged`. |
| `create_project(...)` | Registers an impact project, payment token, and verification deadline. |
| `buy_voucher(buyer, project_id, quantity)` | Transfers payment into the vault and mints an ownership record. |
| `verify_project(verifier, project_id, verified_units, report_hash)` | Lets owner or admin verify delivered impact. |
| `retire_voucher(owner, voucher_id)` | Retires verified impact owned by a voucher holder. |
| `refund_voucher(owner, voucher_id)` | Refunds an unverified voucher after the campaign verification deadline. |
| `withdraw_funds(owner, project_id, amount)` | Lets project owner withdraw verified project funding. |
| `project(project_id)` | Reads project state. |
| `voucher(voucher_id)` | Reads voucher state. |
| `holding(project_id, owner)` | Reads aggregate holder state. |

## Local Development

Install the current Stellar smart contract toolchain:

```bash
rustup target add wasm32v1-none
cargo install --locked stellar-cli
```

On Windows, the official Stellar CLI installer or `winget` can also be used:

```powershell
winget install --id Stellar.StellarCLI
```

Run contract checks:

```bash
cargo test
stellar contract build --package impact-voucher
```

Run backend:

```bash
cd backend
npm install
npm run dev
```

Run frontend:

```bash
cd frontend
npm install
npm run dev
```

Copy `frontend/.env.example` to `frontend/.env` for local frontend contract calls:

```text
VITE_CONTRACT_ID=CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J
VITE_PAYMENT_TOKEN_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
VITE_API_BASE_URL=http://127.0.0.1:8787
```

Quick commands:

```bash
make test
make build-contract
make backend-build
make backend-test
make backend-lint
make frontend-build
make frontend-lint
make verify
```

Windows verification:

```powershell
.\scripts\verify.ps1
```

## Testnet Deployment Notes

Create and fund a Testnet identity:

```bash
stellar keys generate deployer --network testnet --fund
stellar keys address deployer
```

Build and deploy:

```bash
stellar contract build --package impact-voucher
stellar contract deploy \
  --wasm target/wasm32v1-none/release/impact_voucher.wasm \
  --source-account deployer \
  --network testnet \
  --alias green-impact-voucher \
  -- \
  --admin "$(stellar keys address deployer)"
```

Get the native XLM Stellar Asset Contract ID for Testnet:

```bash
stellar contract id asset --asset native --network testnet
```

Example invoke:

```bash
CONTRACT_ID="YOUR_CONTRACT_ID"
DEPLOYER="$(stellar keys address deployer)"
PAYMENT_TOKEN="YOUR_PAYMENT_TOKEN_CONTRACT_ID"

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account deployer \
  --network testnet \
  -- create_project \
  --owner "$DEPLOYER" \
  --project_id 1 \
  --title "Da Nang Solar Classroom" \
  --impact_unit "kWh of verified solar energy" \
  --price_per_voucher 1000000 \
  --unit_per_voucher 10 \
  --payment_token "$PAYMENT_TOKEN" \
  --metadata_hash "ipfs://solar-classroom-metadata" \
  --verification_deadline 1784246400
```

## Quality Gates

- `cargo test`: 20 tests passing.
- `stellar contract build --package impact-voucher`: success.
- WASM size: 15,670 bytes, under the 64KB bootcamp guideline.
- `cd backend && npm run build`: success.
- `cd backend && npm test`: success.
- `cd backend && npm run lint`: success.
- `cd backend && npm audit --omit=dev`: 0 vulnerabilities.
- `npm run build`: success.
- `npm run lint`: success.
- `npm audit --omit=dev`: 0 vulnerabilities.
- No private keys are stored in this repository.
- `.env`, `target`, `frontend/dist`, `frontend/node_modules`, and `backend/.data` are ignored.

## Security Notes

- Every state-changing function requires auth from the affected address.
- Admin operations read admin from storage instead of hardcoding addresses.
- Project and voucher data use typed Soroban storage keys.
- Persistent entries and instance storage extend TTL after writes.
- Contract events are emitted for project creation, purchase, verification, retirement, refund, withdrawal, and admin transfer.
- Arithmetic uses checked operations for funded amount, voucher count, impact units, refunds, and withdrawals.

## Backend Product API

The backend is a product layer for checkout sessions, campaign data, public receipt metadata, proof bundles, merchant dashboard metrics, and indexed transaction references. It does not custody funds, hold private keys, sign transactions, or override Soroban state.

See [docs/backend-api.md](docs/backend-api.md) for endpoint details.

## References Used

- Stellar Developer Docs: <https://developers.stellar.org>
- Soroban Smart Contracts: <https://developers.stellar.org/docs/build/smart-contracts>
- Scaffold Stellar: <https://scaffoldstellar.org>
- Stellar Expert: <https://stellar.expert>
- Stellar Laboratory: <https://laboratory.stellar.org>
- Stellar Community Fund: <https://communityfund.stellar.org>
- Bootcamp reference: <https://github.com/minhbear/soroban-bootcamp>
- Comparison reference: <https://github.com/minhbear/ChainSubscription-Hub>
- Previous project reference: <https://github.com/ngainhau1/solar_stake>

## Submission Materials

- Submission form draft: [docs/submission-form.md](docs/submission-form.md)
- Judging map: [docs/judging-map.md](docs/judging-map.md)
- Vietnamese pitch: [docs/submission-vi.md](docs/submission-vi.md)
- Demo script: [docs/demo-script.md](docs/demo-script.md)
- Backend API: [docs/backend-api.md](docs/backend-api.md)
- Demo video outline: [docs/demo-video-outline.md](docs/demo-video-outline.md)
- Final submission checklist: [docs/final-submission-checklist.md](docs/final-submission-checklist.md)
- Frontend screenshot: [docs/screenshots/frontend-dashboard.png](docs/screenshots/frontend-dashboard.png)
- Stellar Expert screenshot: [docs/screenshots/stellar-expert-contract.png](docs/screenshots/stellar-expert-contract.png)

## Future Scope

- Add oracle-backed meter reports from solar inverters.
- Support multiple impact categories such as solar, clean water, and public transit.
- Add a project registry with off-chain metadata indexing.
- Add voucher transfer support before retirement.
- Package the project for Stellar Community Fund submission.

## Team

Team and contact details are managed through the Rise In hackathon profile and submission form rather than stored in this public repository.
