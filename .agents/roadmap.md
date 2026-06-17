# One-Month Roadmap

## North Star

Turn Green Impact Voucher into a merchant checkout finance product where customers pay through a QR/link checkout, funds are escrowed on Stellar, verified impact unlocks payout, and unverified campaigns can support refunds.

This roadmap targets a complete, production-shaped financial application. The hackathon demo should prove the product path, but the implementation standard must not stop at a simple demo.

Locked big UI direction: **A+C: Satellite Proof + Solar Classroom Journey**. Future UI work should combine immersive nature visuals with transaction proof, using satellite-style verification, solar classroom storytelling, QR checkout, escrow status, and public receipts as one product journey.

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

## Week 3 - Public Proof, Big UI, And Hosted Demo

- Add public receipt page/state with buyer, campaign, impact, paid amount, tx hash, verification/refund state, and Stellar Expert link.
- Add proof timeline: Create Campaign, Buy Voucher, Verify Impact, Retire Voucher, Withdraw Funds, Refund.
- Add richer demo seed data for merchant, customer, verifier, and report hash.
- Rebuild the primary visual direction around A+C: satellite proof surfaces plus solar classroom journey.
- Add local visual assets only: no stock URLs, no remote placeholders, no decorative assets that do not support the product story.
- Add special effects that support proof comprehension: parallax nature layers, satellite scan/proof state, receipt reveal, QR proof pulse, and timeline transitions.
- Add reduced-motion support and verify the app remains usable without animation.
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
5. A+C big UI refresh.
6. Hosted demo.
7. Pitch deck.
8. Demo video.
9. Merchant analytics.
10. Local asset/stable asset explanation.
11. Event indexing/backend.
