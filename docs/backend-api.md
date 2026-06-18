# Backend Product API

Green Impact Voucher uses the backend as a product layer only. It stores merchant-facing product data, checkout sessions, public receipt metadata, proof bundles, refund/deadline display fields, and indexed transaction references. It does not custody funds, hold private keys, sign transactions, or override Soroban state.

## Runtime

```bash
cd backend
npm install
npm run dev
```

Default API base URL:

```text
http://127.0.0.1:8787
```

Frontend integration:

```text
VITE_API_BASE_URL=http://127.0.0.1:8787
```

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness check. |
| `GET` | `/ready` | Readiness check with storage counts. |
| `GET` | `/api/campaigns` | Lists merchant checkout campaigns. |
| `GET` | `/api/campaigns/:projectId` | Reads a campaign by project ID. |
| `POST` | `/api/checkout-sessions` | Creates a QR/link checkout session. |
| `GET` | `/api/checkout-sessions/:sessionId` | Resolves a checkout session. |
| `GET` | `/api/receipts/:voucherId` | Serves receipt metadata for public proof pages. |
| `GET` | `/api/proof/:projectId` | Serves campaign, receipts, contract proof, and ordered timeline proof. |
| `GET` | `/api/merchant/dashboard` | Returns merchant finance and proof metrics. |
| `GET` | `/api/indexer/transactions` | Lists indexed transaction references. |
| `POST` | `/api/indexer/sync` | Syncs seed proof or selected RPC transaction hashes. |

## Checkout Session Payload

```json
{
  "projectId": 1,
  "quantity": 2,
  "buyerAddress": "GBUYER1234567890"
}
```

Response:

```json
{
  "data": {
    "id": "cs_...",
    "projectId": 1,
    "checkoutUrl": "http://127.0.0.1:5173/#/checkout/1?session=cs_...",
    "status": "open",
    "amount": 2000000,
    "impactAmount": 20,
    "impactUnit": "kWh of verified solar energy",
    "contractBacked": true
  }
}
```

Campaign responses include `verificationDeadline`, `refundedAmount`, and `refundStatus` so the frontend can show refund protection without treating backend data as final financial state. Final settlement still comes from Soroban.

## Public Proof Bundle

```text
GET /api/proof/1
GET /api/proof/2
```

Response data includes:

- `campaign`: merchant checkout campaign metadata.
- `receipts`: public customer receipts connected to the project.
- `timeline`: ordered Testnet proof stages with `stage`, `label`, `hash`, `status`, `source`, `syncedAt`, `meaning`, and `stellarExpertUrl`.
- `contractId`, `network`, `contractExplorerUrl`, and `updatedAt`.

Project `1` shows the verified path: Create Campaign, Buy Voucher, Verify Impact, Retire Voucher, Withdraw Funds. Project `2` shows the refund path: Create Refund Pilot, Buy Refund Pilot Voucher, Refund Voucher.

## Storage

The default local storage file is ignored by git:

```text
backend/.data/green-impact-voucher.local.json
```

Use `BACKEND_STORAGE_FILE=memory` for ephemeral test/dev runs.

## Verification

```bash
cd backend
npm run build
npm test
npm run lint
npm audit --omit=dev
```
