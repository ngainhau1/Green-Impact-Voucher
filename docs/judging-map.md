# Judging Map

This file maps the APAC Stellar Hackathon expectations to concrete evidence in this repository.

## User-Facing Financial Application

Evidence:

- UI modes in `frontend/src/App.jsx`: Customer Checkout, Merchant Console, Verifier Vault.
- Impact Receipt in `frontend/src/App.jsx`.
- Public receipt route `#/receipt/voucher-1` and proof timeline routes `#/proof/1`, `#/proof/2`.
- Submission description in `docs/submission-form.md`.

Why it matters:

Green Impact Voucher is not only a tracker. It includes customer payment, voucher issuance, vault custody, impact verification, retirement, and conditional payout.

## Real Stellar/Soroban Usage

Evidence:

- Contract: `contracts/impact_voucher/src/lib.rs`.
- Payment token: native XLM Stellar Asset Contract on Testnet.
- Testnet contract: `CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J`.
- Contract Explorer: <https://stellar.expert/explorer/testnet/contract/CBN5FTEU5CYVGOJCP5D567ALVH2VQ4IHZIU7WG5CDZ7RM3QFXNTW2R4J>

Implemented Soroban operations:

- `buy_voucher`: transfers payment into the contract vault.
- `verify_project`: records verified units and report hash.
- `retire_voucher`: marks funded impact as retired by the voucher owner.
- `refund_voucher`: returns funds to the voucher owner when a campaign misses its verification deadline.
- `withdraw_funds`: releases vault funds only after verification.

## Local Economy Fit

Evidence:

- Campaign story: `Da Nang Solar Classroom`.
- UI proof card: Stellar Testnet, contract, payment asset, and verified report.
- Vietnamese pitch: `docs/submission-vi.md`.

Why it matters:

The product targets cafes, campus events, local merchants, SMEs, and local green projects in Vietnam/APAC. It gives local checkout payments a transparent impact layer.

## Composability and Ecosystem Fit

Evidence:

- Uses Freighter wallet through `@stellar/freighter-api`.
- Uses Stellar SDK through `@stellar/stellar-sdk`.
- Links every major transaction to Stellar Expert.
- Backend proof bundle endpoint exposes ordered Testnet proof for verified and refund paths.
- Uses native XLM SAC now; roadmap includes local stable assets or anchor-issued assets.

## Technical Quality

Evidence:

- 20 Soroban tests in `contracts/impact_voucher/src/test.rs`.
- Custom errors in `ContractError`.
- Typed storage keys in `DataKey`.
- Contract events for project creation, purchase, verification, retirement, refund, withdrawal, and admin transfer.
- TTL extension after writes.
- Checked arithmetic for critical state transitions.
- WASM size: 15,670 bytes.

Quality commands:

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

## Testnet Proof

| Flow | Evidence |
| --- | --- |
| WASM upload | <https://stellar.expert/explorer/testnet/tx/9171b2e5efa4139cff02c248a16299f3e403df4a0ef7a6fac681b3e3fd5eef02> |
| Deploy | <https://stellar.expert/explorer/testnet/tx/7f64a44e66e7c2048ca8be074e3f2f12f3d4cc7ca1e0e3c8abb97d9775bc1cda> |
| Create project | <https://stellar.expert/explorer/testnet/tx/355f56f9f492a4e33ec90260ddf6347b8f6a25176b7618b72634344487d511ab> |
| Buy voucher | <https://stellar.expert/explorer/testnet/tx/ce18365fcaa1ab024be0f417175713c677afb98321209dce9c4d741e9f897a96> |
| Verify project | <https://stellar.expert/explorer/testnet/tx/6797048bcd49d9d96b05c3fbf5b2b4917edc4f29b9e11e006952ffcb8f77547d> |
| Retire voucher | <https://stellar.expert/explorer/testnet/tx/a4735c7a6f90cf21340dbe8c7b885c36308008f097f926bf0f768e9197b95f06> |
| Withdraw funds | <https://stellar.expert/explorer/testnet/tx/c8062efdd8e0512f88bcf2908bef4f085d2b4d5175202f8d8b5b304c4b55e984> |
| Refund voucher | <https://stellar.expert/explorer/testnet/tx/7b44332277ce3be6b4d3167cf67f323b2956cb22593108ab4726b2537c28f9bf> |

## Demo Evidence

- Frontend screenshot: `docs/screenshots/frontend-dashboard.png`.
- Stellar Expert screenshot: `docs/screenshots/stellar-expert-contract.png`.
- Demo script: `docs/demo-script.md`.
- Demo video outline: `docs/demo-video-outline.md`.
- Public receipt: `http://127.0.0.1:5173/#/receipt/voucher-1`.
- Verified proof timeline: `http://127.0.0.1:5173/#/proof/1`.
- Refund proof timeline: `http://127.0.0.1:5173/#/proof/2`.

## Remaining Submission-Portal Items

These require the builder's account or external upload destination:

- Public GitHub repository URL.
- Demo video URL.
- Team/contact information in Rise In profile.
- Optional hosted frontend URL.
