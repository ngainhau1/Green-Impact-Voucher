# Judging Map

This file maps the APAC Stellar Hackathon expectations to concrete evidence in this repository.

## User-Facing Financial Application

Evidence:

- UI modes in `frontend/src/App.jsx`: Customer Checkout, Merchant Console, Verifier Vault.
- Impact Receipt in `frontend/src/App.jsx`.
- Submission description in `docs/submission-form.md`.

Why it matters:

Green Impact Voucher is not only a tracker. It includes customer payment, voucher issuance, vault custody, impact verification, retirement, and conditional payout.

## Real Stellar/Soroban Usage

Evidence:

- Contract: `contracts/impact_voucher/src/lib.rs`.
- Payment token: native XLM Stellar Asset Contract on Testnet.
- Testnet contract: `CDIGDTCOY3J6YHVXXBKK7NWLSLYHYV3OAPMSWHQJTPKQ4QBY4QVV4GL3`.
- Contract Explorer: <https://stellar.expert/explorer/testnet/contract/CDIGDTCOY3J6YHVXXBKK7NWLSLYHYV3OAPMSWHQJTPKQ4QBY4QVV4GL3>

Implemented Soroban operations:

- `buy_voucher`: transfers payment into the contract vault.
- `verify_project`: records verified units and report hash.
- `retire_voucher`: marks funded impact as retired by the voucher owner.
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
- Uses native XLM SAC now; roadmap includes local stable assets or anchor-issued assets.

## Technical Quality

Evidence:

- 12 Soroban tests in `contracts/impact_voucher/src/test.rs`.
- Custom errors in `ContractError`.
- Typed storage keys in `DataKey`.
- Contract events for project creation, purchase, verification, retirement, withdrawal, and admin transfer.
- TTL extension after writes.
- Checked arithmetic for critical state transitions.
- WASM size: 13,403 bytes.

Quality commands:

```bash
cargo test
stellar contract build --package impact-voucher
cd frontend
npm run build
npm run lint
npm audit --omit=dev
```

## Testnet Proof

| Flow | Evidence |
| --- | --- |
| WASM upload | <https://stellar.expert/explorer/testnet/tx/1e72f62f3f2e67ddce22b49be1fdcbcfa8bba19f064cf8956f023b9d86b404ea> |
| Deploy | <https://stellar.expert/explorer/testnet/tx/21141e51c1945035d66bbebd22da66aff369ba842cd3e3469d6564303c118c84> |
| Create project | <https://stellar.expert/explorer/testnet/tx/d3280934101aa3e21da70c0885d3c23aa33a24864be3ab4e3f1ce496188adaa9> |
| Buy voucher | <https://stellar.expert/explorer/testnet/tx/472998d13bce42752cd682ae63b074f21348c6ffec719a23de79348398f51702> |
| Verify project | <https://stellar.expert/explorer/testnet/tx/bfe5b3cfa4a2b5e52d236ab20c801cefee685880dfc5a837f2fc24927a65952c> |
| Retire voucher | <https://stellar.expert/explorer/testnet/tx/8f2a42d3a58291cf19d1b3b39d536fc2e490a3a87c24d5d8ac0163aa0420744b> |
| Withdraw funds | <https://stellar.expert/explorer/testnet/tx/cea81936292151d40393a9eba007f71e24408e826fdf96ff4363c811094ca3b5> |

## Demo Evidence

- Frontend screenshot: `docs/screenshots/frontend-dashboard.png`.
- Stellar Expert screenshot: `docs/screenshots/stellar-expert-contract.png`.
- Demo script: `docs/demo-script.md`.
- Demo video outline: `docs/demo-video-outline.md`.

## Remaining Submission-Portal Items

These require the builder's account or external upload destination:

- Public GitHub repository URL.
- Demo video URL.
- Team/contact information in Rise In profile.
- Optional hosted frontend URL.
