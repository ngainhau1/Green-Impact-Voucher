# Demo Script

## 0. Setup

- Open the frontend at `http://127.0.0.1:5173/`.
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

## 2. Show the Contract

Open `contracts/impact_voucher/src/lib.rs` and point out:

- `require_auth()` on every state-changing user/admin action.
- `token::Client.transfer()` inside `buy_voucher` and `withdraw_funds`.
- Typed storage keys in `DataKey`.
- Typed errors in `ContractError`.
- TTL extension after writes.
- Events for project creation, purchase, verification, retirement, withdrawal, and admin transfer.
- `admin()` and `set_admin(current_admin, new_admin)` added from bootcamp-style best practices.

## 3. Show Testnet Proof

Open Stellar Expert:

- Contract page: `CDIGDTCOY3J6YHVXXBKK7NWLSLYHYV3OAPMSWHQJTPKQ4QBY4QVV4GL3`
- Contract URL: <https://stellar.expert/explorer/testnet/contract/CDIGDTCOY3J6YHVXXBKK7NWLSLYHYV3OAPMSWHQJTPKQ4QBY4QVV4GL3>
- WASM upload transaction: `1e72f62f3f2e67ddce22b49be1fdcbcfa8bba19f064cf8956f023b9d86b404ea`
- Deploy transaction: `21141e51c1945035d66bbebd22da66aff369ba842cd3e3469d6564303c118c84`
- `create_project` transaction: `d3280934101aa3e21da70c0885d3c23aa33a24864be3ab4e3f1ce496188adaa9`
- `buy_voucher` transaction: `472998d13bce42752cd682ae63b074f21348c6ffec719a23de79348398f51702`
- `verify_project` transaction: `bfe5b3cfa4a2b5e52d236ab20c801cefee685880dfc5a837f2fc24927a65952c`
- `retire_voucher` transaction: `8f2a42d3a58291cf19d1b3b39d536fc2e490a3a87c24d5d8ac0163aa0420744b`
- `withdraw_funds` transaction: `cea81936292151d40393a9eba007f71e24408e826fdf96ff4363c811094ca3b5`

Key proof line: `buy_voucher` transfers 2,000,000 stroops into the contract vault, and `withdraw_funds` transfers 1,000,000 stroops back to the owner only after verification.

## 4. Show the Frontend Flow

1. Show the three product modes: `Customer Checkout`, `Merchant Console`, and `Verifier Vault`.
2. Show the top proof card with Stellar Testnet, contract, payment asset, and verified report.
3. Show the customer checkout quote: voucher price, impact funded, escrow status, and `Buy Voucher`.
4. Show the Impact Receipt: buyer, campaign, impact, paid amount, transaction, and verification status.
5. Connect Freighter.
6. Buy a voucher and open the Stellar Expert transaction link.
7. Verify project impact from the owner/admin account.
8. Retire voucher ID `1`.
9. Show that the Impact Passport and vault counters refresh after transactions.

## 5. Quality Gates

Run or show the latest output:

```bash
cargo test
stellar contract build --package impact-voucher
cd frontend
npm run build
npm run lint
npm audit --omit=dev
```

Expected result:

- 12 contract tests pass.
- WASM builds successfully and is under 64KB.
- Frontend build and lint pass.
- Audit reports 0 vulnerabilities.

## 6. Close

The key Stellar advantage is that small climate contributions become economically viable, fast to settle, and publicly verifiable without a centralized proof database.
