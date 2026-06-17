export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8787";

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error?.message || `API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, body);
  }
  return body;
}

export function fetchCampaigns() {
  return request("/api/campaigns");
}

export function fetchMerchantDashboard() {
  return request("/api/merchant/dashboard");
}

export function createCheckoutSession(payload) {
  return request("/api/checkout-sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCheckoutSession(sessionId) {
  return request(`/api/checkout-sessions/${encodeURIComponent(sessionId)}`);
}
