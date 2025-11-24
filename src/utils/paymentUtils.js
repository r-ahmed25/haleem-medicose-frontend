// src/utils/paymentUtils.js
import api from "../lib/axios";

/**
 * verifyPayment
 * Sends the payment payload to /payment/verifypayment and returns the server response object.
 *
 * Behavior:
 *  - If server returns { needs_address: true, ... } -> returns that object (caller handles).
 *  - If server returns { success: true, ... } -> returns that object (caller handles).
 *  - If server returns a non-success body that doesn't include needs_address -> throws Error(server.message || JSON).
 *  - If network/CORS/timeout -> throws Error with helpful message.
 *
 * Notes:
 *  - payload must include payment_id, order_id, signature. shippingAddress is optional (finalization).
 *  - api should be an axios instance configured with withCredentials: true if you rely on cookie auth.
 *
 * @param {Object} payload
 * @param {number} [opts.timeout=10000] - request timeout in ms
 * @param {number} [opts.retries=1] - network retry attempts (only for network-level failures)
 * @returns {Promise<Object>} server response body
 * @throws {Error} on unexpected/server errors
 */
export async function verifyPayment(payload, opts = {}) {
  const { timeout = 10000, retries = 1 } = opts;

  // Basic validation so callers fail fast when they pass something wrong
  if (!payload || typeof payload !== "object") {
    throw new Error("verifyPayment: payload must be an object");
  }
  const { payment_id, order_id, signature } = payload;
  if (!payment_id || !order_id || !signature) {
    throw new Error("verifyPayment: payload must include payment_id, order_id and signature");
  }

  // helper to extract server body safely
  const extractServerData = (err) => {
    if (err && err.response && typeof err.response.data !== "undefined") return err.response.data;
    return null;
  };

  // small exponential backoff
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let attempt = 0;
  while (attempt <= retries) {
    attempt += 1;
    try {
      console.debug("[verifyPayment] attempt", attempt, "payload:", { payment_id, order_id, signature, orderItems: payload.orderItems?.length ?? 0 });

      const res = await api.post("/payment/verifypayment", payload, { timeout });

      // 2xx response — return server body unchanged
      console.debug("[verifyPayment] server 2xx body:", res.data);
      return res.data;
    } catch (err) {
      const serverData = extractServerData(err);

      // If server responded with a body, prefer that (it may be { needs_address: true })
      if (serverData) {
        console.debug("[verifyPayment] server returned non-2xx body:", serverData);

        // If server explicitly asks for address — return to caller (recoverable)
        if (serverData.needs_address) return serverData;

        // If server returned an explicit message, throw it so caller sees the failure
        const msg = serverData.message || "Payment verification failed (server)";
        throw new Error(msg);
      }

      // No server body — this is a network/CORS/timeout or axios-level failure.
      // If we still have retry budget, backoff and retry; otherwise throw.
      const isNetworkError = !!(err && (err.code === "ECONNABORTED" || err.message?.toLowerCase()?.includes("network") || err.message?.toLowerCase()?.includes("timeout") || err.isAxiosError));

      console.warn("[verifyPayment] network/unexpected error", err?.message || err, "attempt", attempt, "of", retries + 1);

      if (isNetworkError && attempt <= retries) {
        // exponential backoff: 300ms * 2^(attempt-1)
        const backoff = 300 * 2 ** (attempt - 1);
        console.debug(`[verifyPayment] retrying after ${backoff}ms...`);
        await sleep(backoff);
        continue;
      }

      // Give a helpful error to the caller
      const hint = err?.message ? ` (${err.message})` : "";
      throw new Error(`Network or server unreachable when verifying payment${hint}`);
    }
  }

  // Should not get here
  throw new Error("verifyPayment: unexpected control flow");
}

export default verifyPayment;
