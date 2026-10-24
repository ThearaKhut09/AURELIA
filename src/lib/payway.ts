/**
 * ABA PayWay integration — implemented against the official Ecommerce
 * Checkout API (https://developer.payway.com.kh/):
 *
 *  1. Purchase        POST {base}/api/payment-gateway/v1/payments/purchase
 *     multipart/form-data; hash = base64(HMAC-SHA512(apiKey, concatenated
 *     VALUES in a fixed field order — no keys, no separators)).
 *  2. Pushback        PayWay POSTs JSON {tran_id, apv, status, return_params}
 *     to the API-level `return_url`; verified via the X-PayWay-HMAC-SHA512
 *     header (sorted keys, concatenated values, HMAC-SHA512, base64).
 *  3. Check Transaction POST {base}/api/payment-gateway/v1/payments/check-transaction-2
 *     — authoritative status source for polling / reconciliation.
 *
 * Node runtime only (uses node:crypto).
 */
import crypto from "node:crypto";

export const PAYWAY_BASE_URL =
  process.env.PAYWAY_BASE_URL ?? "https://checkout-sandbox.payway.com.kh";

export const PURCHASE_ENDPOINT = `${PAYWAY_BASE_URL}/api/payment-gateway/v1/payments/purchase`;
export const CHECK_TRANSACTION_ENDPOINT = `${PAYWAY_BASE_URL}/api/payment-gateway/v1/payments/check-transaction-2`;

export type PaywayPaymentOption =
  | "abapay_khqr" // ABA PAY + KHQR (ACLEDA, Wing, Canadia, …)
  | "cards" // Visa / Mastercard / UnionPay
  | "abapay_khqr_deeplink"
  | "google_pay";

/** True when real PayWay merchant credentials are configured. */
export function paywayConfigured(): boolean {
  return Boolean(process.env.PAYWAY_MERCHANT_ID && process.env.PAYWAY_API_KEY);
}

/** Demo payments allowed only outside production (see /api/checkout). */
export function demoModeEnabled(): boolean {
  return (
    process.env.PAYWAY_DEMO_MODE === "true" && process.env.NODE_ENV !== "production"
  );
}

/** Current time in Cambodia (UTC+7) as yyyyMMddHHmmss — PayWay req_time. */
export function paywayReqTime(date: Date = new Date()): string {
  const t = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return t.toISOString().replace(/[-T:Z.]/g, "").slice(0, 14);
}

function hmac512Base64(data: string, key: string): string {
  return crypto.createHmac("sha512", key).update(data, "utf8").digest("base64");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// Canonical hash order — official sample: concatenate VALUES for fields in
// this exact sequence (empty/omitted fields contribute nothing).
const PURCHASE_HASH_ORDER = [
  "req_time",
  "merchant_id",
  "tran_id",
  "amount",
  "items",
  "shipping",
  "firstname",
  "lastname",
  "email",
  "phone",
  "type",
  "payment_option",
  "return_url",
  "cancel_url",
  "continue_success_url",
  "return_deeplink",
  "currency",
  "custom_fields",
  "return_params",
  "payout",
  "lifetime",
  "additional_params",
  "google_pay_token",
  "skip_success_page",
] as const;

export interface PurchaseInput {
  tranId: string;
  amountUsd: number;
  /** line items — informational for the PayWay dashboard */
  items: Array<{ name: string; quantity: number; price: number }>;
  /** API-level return_url = JSON pushback receiver (webhook). Sent base64. */
  returnUrl: string;
  cancelUrl: string;
  continueSuccessUrl: string;
  paymentOption?: PaywayPaymentOption; // omit → gateway shows configured methods
  currency?: "USD" | "KHR";
  customer?: { firstName?: string; lastName?: string; email?: string; phone?: string };
  shippingUsd?: number;
}

export interface PurchaseFields {
  [key: string]: string;
}

/** Build the signed multipart form fields for the hosted checkout. */
export function buildPurchaseFields(input: PurchaseInput): PurchaseFields {
  const merchantId = process.env.PAYWAY_MERCHANT_ID ?? "";
  const apiKey = process.env.PAYWAY_API_KEY ?? "";

  const fields: Record<string, string> = {
    req_time: paywayReqTime(),
    merchant_id: merchantId,
    tran_id: input.tranId,
    amount: input.amountUsd.toFixed(2),
    type: "purchase",
    currency: input.currency ?? "USD",
    return_url: Buffer.from(input.returnUrl, "utf8").toString("base64"),
    cancel_url: Buffer.from(input.cancelUrl, "utf8").toString("base64"),
    continue_success_url: input.continueSuccessUrl,
    items: Buffer.from(
      JSON.stringify(
        input.items.map((i) => ({
          name: i.name.slice(0, 80),
          quantity: i.quantity,
          price: i.price,
        })),
      ),
      "utf8",
    ).toString("base64"),
    view_type: "hosted_view",
  };

  if (input.shippingUsd && input.shippingUsd > 0) {
    fields.shipping = input.shippingUsd.toFixed(2);
  }
  if (input.paymentOption) {
    fields.payment_option = input.paymentOption;
  }
  if (input.customer) {
    const { firstName, lastName, email, phone } = input.customer;
    if (firstName) fields.firstname = firstName.replace(/[^a-zA-Z\u1780-\u17FF ]/g, "").slice(0, 100);
    if (lastName) fields.lastname = lastName.replace(/[^a-zA-Z\u1780-\u17FF ]/g, "").slice(0, 100);
    if (email) fields.email = email.slice(0, 50);
    if (phone) fields.phone = phone.slice(0, 20);
  }

  // Drop empty values (they must not be sent, and contribute nothing to hash).
  for (const k of Object.keys(fields)) {
    if (fields[k] === "" || fields[k] === undefined) delete fields[k];
  }

  let b4hash = "";
  for (const key of PURCHASE_HASH_ORDER) {
    const value = fields[key];
    if (value !== undefined) b4hash += value;
  }
  fields.hash = hmac512Base64(b4hash, apiKey);
  return fields;
}

/**
 * Verify the PayWay pushback: HTTP POST (application/json) to our
 * `return_url`, body {tran_id, apv, status, return_params}, signature in the
 * `X-PayWay-HMAC-SHA512` header over the body values, keys sorted ascending.
 */
export function verifyPushback(
  body: Record<string, unknown>,
  signature: string | null | undefined,
): boolean {
  if (!signature) return false;
  const apiKey = process.env.PAYWAY_API_KEY ?? "";
  let toSign = "";
  for (const key of Object.keys(body).sort()) {
    const value = body[key];
    if (value !== null && typeof value === "object") toSign += JSON.stringify(value);
    else toSign += String(value ?? "");
  }
  return safeEqual(hmac512Base64(toSign, apiKey), signature);
}

export type PaywayTransactionStatus =
  | "APPROVED"
  | "PENDING"
  | "DECLINED"
  | "REFUNDED"
  | "CANCELLED"
  | "ERROR";

export interface CheckResult {
  status: PaywayTransactionStatus;
  raw: unknown;
}

/** Check Transaction API — authoritative status for a tran_id. */
export async function checkTransaction(tranId: string): Promise<CheckResult> {
  const merchantId = process.env.PAYWAY_MERCHANT_ID ?? "";
  const apiKey = process.env.PAYWAY_API_KEY ?? "";
  const req_time = paywayReqTime();
  const hash = hmac512Base64(`${req_time}${merchantId}${tranId}`, apiKey);

  try {
    const res = await fetch(CHECK_TRANSACTION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        req_time,
        merchant_id: merchantId,
        tran_id: tranId,
        hash,
      }),
      cache: "no-store",
    });
    const json = (await res.json()) as Record<string, unknown>;
    const data = (json.data ?? json) as Record<string, unknown> | undefined;
    const status = String(data?.payment_status ?? "").toUpperCase();
    const known: PaywayTransactionStatus[] = [
      "APPROVED",
      "PENDING",
      "DECLINED",
      "REFUNDED",
      "CANCELLED",
    ];
    const normalized: PaywayTransactionStatus = known.includes(
      status as PaywayTransactionStatus,
    )
      ? (status as PaywayTransactionStatus)
      : "ERROR";
    return { status: normalized, raw: json };
  } catch (error) {
    console.error("[payway] checkTransaction failed:", error);
    return { status: "ERROR", raw: null };
  }
}
