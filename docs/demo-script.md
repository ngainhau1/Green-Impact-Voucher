# Demo Script

## 0. Setup

- Open the frontend at `http://127.0.0.1:5173/`.
- Keep public proof routes ready: `#/receipt/voucher-1`, `#/proof/1`, and `#/proof/2`.
- Connect Freighter on Stellar Testnet.
- Show `README.md` and `docs/screenshots/`.
- Mention that `.env`, private keys, `target`, `frontend/dist`, and `frontend/node_modules` are ignored.

## 1. Explain the Project

Green Impact Voucher is a green checkout finance application on Stellar. A cafe, event, or SME can let customers add a small verified-impact voucher at checkout. Each voucher represents a concrete impact unit, such as kWh of solar energy funded. The contract records customer payment, voucher ownership, verification, retirement, and vault withdrawals.

Use the concrete story:

- Merchant: a Da Nang cafe or campus event.
- Customer: pays `0.10 XLM` for a Solar Classroom Voucher.
- Impact: `10 kWh of verified solar energy`.
- Settlement rule: funds enter the smart contract vault first and unlock only after a verified report.
- Refund rule: if no impact is verified after the campaign deadline, the customer can claim the voucher refund.

## 2. Show the Contract

Open `contracts/impact_voucher/src/lib.rs` and point out:

- `require_auth()` on every state-changing user/admin action.
- `token::Client.transfer()` inside `buy_voucher` and `withdraw_funds`.
- Typed storage keys in `DataKey`.
- Typed errors in `ContractError`.
- TTL extension after writes.
- Events for project creation, purchase, verification, retirement, refund, withdrawal, and admin transfer.
- `admin()` and `set_admin(current_admin, new_admin)` added from bootcamp-style best practices.
- `refund_voucher(owner, voucher_id)` added for deadline-based consumer protection.

## 3. Show Testnet Proof

Open Stellar Expert:

- Contract page: `CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J`
- Contract URL: <https://stellar.expert/explorer/testnet/contract/CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J>
- WASM upload transaction: `9171b2e5efa4139cff02c248a16299f3e403df4a0ef7a6fac681b3e3fd5eef02`
- Deploy transaction: `7f64a44e66e7c2048ca8be074e3f2f12f3d4cc7ca1e0e3c8abb97d9775bc1cda`
- `create_project` transaction: `355f56f9f492a4e33ec90260ddf6347b8f6a25176b7618b72634344487d511ab`
- `buy_voucher` transaction: `ce18365fcaa1ab024be0f417175713c677afb98321209dce9c4d741e9f897a96`
- `verify_project` transaction: `6797048bcd49d9d96b05c3fbf5b2b4917edc4f29b9e11e006952ffcb8f77547d`
- `retire_voucher` transaction: `a4735c7a6f90cf21340dbe8c7b885c36308008f097f926bf0f768e9197b95f06`
- `withdraw_funds` transaction: `c8062efdd8e0512f88bcf2908bef4f085d2b4d5175202f8d8b5b304c4b55e984`
- `refund_voucher` transaction: `7b44332277ce3be6b4d3167cf67f323b2956cb22593108ab4726b2537c28f9bf`

Key proof line: `buy_voucher` transfers 2,000,000 stroops into the contract vault, `withdraw_funds` transfers 1,000,000 stroops back to the owner only after verification, and `refund_voucher` transfers 500,000 stroops back to the buyer after an unverified campaign misses its deadline.

## 4. Show the Frontend Flow

1. Show the A+C hero: Satellite Proof plus Solar Classroom Journey.
2. Show the satellite proof map with scan motion, Stellar Testnet, contract, payment asset, and verified report.
3. Show the Solar Classroom Journey section: checkout, vault, satellite proof, and public receipt.
4. Show the three product modes: `Customer Checkout`, `Merchant Console`, and `Verifier Vault`.
5. Show the customer checkout quote: voucher price, impact funded, escrow status, and `Buy Voucher`.
6. Show the Impact Receipt: buyer, campaign, impact, paid amount, transaction, and verification status.
7. Open the public receipt page at `http://127.0.0.1:5173/#/receipt/voucher-1`.
8. Open the verified proof timeline at `http://127.0.0.1:5173/#/proof/1`.
9. Open the refund proof timeline at `http://127.0.0.1:5173/#/proof/2`.
10. Connect Freighter.
11. Buy a voucher and open the Stellar Expert transaction link.
12. Verify project impact from the owner/admin account.
13. Retire voucher ID `1`.
14. Show the refund policy/deadline fields and the `Claim Refund` control.
15. Show that the Impact Passport and vault counters refresh after transactions.

## 5. Quality Gates

Run or show the latest output:

```bash
cargo test
stellar contract build --package impact-voucher
cd frontend
npm run build
npm run lint
npm audit --omit=dev
cd ../backend
npm run build
npm test
npm run lint
npm audit --omit=dev
```

Expected result:

- 20 contract tests pass.
- WASM builds successfully and is under 64KB.
- Frontend build and lint pass.
- Backend build, 8 API tests, and lint pass.
- Audit reports 0 vulnerabilities.

## 6. Close

The key Stellar advantage is that small climate contributions become economically viable, fast to settle, and publicly verifiable without a centralized proof database.
