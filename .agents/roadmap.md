# One-Month Roadmap

## North Star

Turn Green Impact Voucher into a merchant checkout finance product where customers pay through a QR/link checkout, funds are escrowed on Stellar, verified impact unlocks payout, and unverified campaigns can support refunds.

## Week 1 - Checkout Product Layer

- Add Merchant Console campaign list and campaign detail.
- Add QR/link checkout generator for each campaign.
- Add route-like frontend state for customer checkout by project ID.
- Make the customer flow end in a receipt state after purchase.
- Refresh screenshot and README if the UI changes.

## Week 2 - Refund-Protected Escrow

- Add project deadline or verification deadline to the contract model.
- Add refund eligibility for unverified campaigns after deadline.
- Add `refund_voucher(owner, voucher_id)` or equivalent.
- Prevent refund before deadline, refund after verification, double refund, and invalid-owner refund.
- Ensure withdrawals account for refunded vouchers.
- Redeploy Testnet only after tests pass, then update README, docs, and frontend `.env.example`.

## Week 3 - Public Proof And Hosted Demo

- Add public receipt page/state with buyer, campaign, impact, paid amount, tx hash, verification/refund state, and Stellar Expert link.
- Add proof timeline: Create Campaign, Buy Voucher, Verify Impact, Retire Voucher, Withdraw Funds, Refund.
- Add richer demo seed data for merchant, customer, verifier, and report hash.
- Deploy frontend to Vercel or Netlify.
- Update README with hosted URL and fresh screenshot.

## Week 4 - Submission Package

- Finalize Canva pitch deck in English.
- Record 2-3 minute demo video.
- Add demo video URL and hosted frontend URL to README and submission docs.
- Rehearse final demo path with Stellar Expert proof.
- Run full verification and final security/secret scan.

## Priority If Time Is Limited

1. QR checkout and checkout link.
2. Public receipt page.
3. Refund-if-not-verified contract logic.
4. Proof timeline.
5. Hosted demo.
6. Pitch deck.
7. Demo video.
8. Merchant analytics.
9. Local asset/stable asset explanation.
10. Event indexing/backend.
