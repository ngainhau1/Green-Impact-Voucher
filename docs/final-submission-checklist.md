# Final Submission Checklist

Use this checklist before uploading the project to the Rise In APAC Stellar Hackathon portal.

## Repository

- Push the repository to a public GitHub repo.
- Confirm `.env`, private keys, `target/`, `frontend/dist/`, and `frontend/node_modules/` are not committed.
- Confirm `README.md` opens with the fintech checkout screenshot and links to Testnet proof.
- Confirm the GitHub repo contains:
  - `contracts/impact_voucher/src/lib.rs`
  - `contracts/impact_voucher/src/test.rs`
  - `frontend/src/App.jsx`
  - `docs/submission-form.md`
  - `docs/judging-map.md`
  - `docs/submission-vi.md`
  - `docs/demo-script.md`
  - `docs/demo-video-outline.md`
  - `docs/screenshots/frontend-dashboard.png`
  - `docs/screenshots/stellar-expert-contract.png`

## Project Links

- GitHub repository URL.
- Demo video URL.
- Optional hosted frontend URL.
- Stellar Expert contract URL: <https://stellar.expert/explorer/testnet/contract/CDIGDTCOY3J6YHVXXBKK7NWLSLYHYV3OAPMSWHQJTPKQ4QBY4QVV4GL3>

## Rise In Form Content

- Project title: Green Impact Voucher.
- Tagline: Green checkout finance, verified on Stellar.
- Problem and solution: use `docs/submission-form.md`.
- Demo flow: use `docs/demo-video-outline.md`.
- Vietnamese explanation if needed: use `docs/submission-vi.md`.
- Team and contact details: enter through the Rise In profile/form.

## Quality Gates

Run these before submission:

```bash
cargo test
stellar contract build --package impact-voucher
cd frontend
npm run build
npm run lint
npm audit --omit=dev
```

On Windows, the same checks can be run with:

```powershell
.\scripts\verify.ps1
```

Expected result:

- 12 contract tests pass.
- WASM build succeeds.
- WASM size remains under 64KB.
- Frontend build and lint pass.
- Audit reports 0 vulnerabilities.

## Demo Video Must Show

- Customer Checkout mode.
- Merchant Console mode.
- Verifier Vault mode.
- Impact Receipt.
- Stellar Expert contract page.
- Buy voucher transaction.
- Withdraw funds transaction.
