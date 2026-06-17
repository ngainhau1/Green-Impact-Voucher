# Acceptance Criteria

## Product Direction

- Pass: the project is framed as green checkout finance on Stellar.
- Pass: the primary track is Payment & Consumer Applications.
- Pass: every major decision treats the final goal as a complete financial application, not a throwaway demo.
- Fail: the project is described only as an environmental dashboard or donation tracker.
- Fail: features, docs, or submission materials describe the repo as only a simple demo instead of a complete product in progress.

## Contract

- Pass: all state-changing functions require the correct auth.
- Pass: customer payment moves through token transfer into contract custody.
- Pass: verification controls withdrawal eligibility.
- Pass: new refund work includes deadline, refund status, double-refund prevention, and withdrawal accounting tests.
- Fail: any contract redeploy happens without updating README, frontend config examples, and Testnet proof.

## Frontend

- Pass: UI has Customer Checkout, Merchant Console, Verifier Vault, proof card, vault ledger, and receipt-grade proof.
- Pass: desktop and mobile have no horizontal overflow.
- Pass: public copy is English-first.
- Pass: screenshots are refreshed after primary UI changes.
- Fail: placeholder images, stock URLs, or generic eco-dashboard visual language are introduced.

## Documentation And Submission

- Pass: README includes screenshot, track, contract ID, Stellar Expert link, transaction proof, setup commands, and verification commands.
- Pass: pitch deck plan includes Market Overview, Problem, Solution, Stellar Integration, USP/Competition, GTM, Team, and Demo.
- Pass: demo video plan shows app, Freighter, Stellar Expert, and transaction proof.
- Pass: docs explain the complete product path across merchant, customer, verifier, receipt, refund, analytics, and hosted deployment.
- Fail: docs drift from the current deployed contract or frontend behavior.

## Verification

- Pass: `.\scripts\verify.ps1` completes.
- Pass: `npm audit --omit=dev` reports 0 vulnerabilities.
- Pass: `.env`, `frontend/node_modules`, `frontend/dist`, and `target` remain ignored.
- Pass: file changes are reported without committing unless the user explicitly requested commit/push in the current conversation.
- Fail: an agent commits, amends, tags, pushes, or opens a pull request without explicit user instruction for that exact git action.
