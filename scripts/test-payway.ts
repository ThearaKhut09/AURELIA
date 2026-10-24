import crypto from "node:crypto";
import { buildPurchaseFields, verifyPushback } from "../src/lib/payway";

process.env.PAYWAY_MERCHANT_ID = "testmerchant";
process.env.PAYWAY_API_KEY = "testkey";

const fields = buildPurchaseFields({
  tranId: "AUR-TEST-001",
  amountUsd: 52.8,
  items: [{ name: "Jasmine Dew Hydrating Serum", quantity: 1, price: 48 }],
  returnUrl: "https://site.com/api/payway/webhook",
  cancelUrl: "https://site.com/checkout?canceled=1",
  continueSuccessUrl: "https://site.com/checkout/success?tran_id=AUR-TEST-001",
  paymentOption: "abapay_khqr",
  customer: { firstName: "Sokha", lastName: "Chan", email: "s@example.com", phone: "012345678" },
});

console.log("req_time 14 digits:", /^\d{14}$/.test(fields.req_time), fields.req_time);
console.log(
  "return_url base64:",
  fields.return_url === Buffer.from("https://site.com/api/payway/webhook").toString("base64"),
);
console.log("hash present:", /^[A-Za-z0-9+/=]+$/.test(fields.hash));

// Canonical string: concatenated VALUES in the official field order:
// req_time, merchant_id, tran_id, amount, items, shipping, firstname,
// lastname, email, phone, type, payment_option, return_url, cancel_url,
// continue_success_url, return_deeplink, currency, ... (unsent fields
// contribute nothing)
const expected = [
  fields.req_time,
  "testmerchant",
  "AUR-TEST-001",
  "52.80",
  fields.items,
  "Sokha",
  "Chan",
  "s@example.com",
  "012345678",
  "purchase",
  fields.payment_option,
  fields.return_url,
  fields.cancel_url,
  fields.continue_success_url,
  fields.currency,
].join("");
const expectHash = crypto
  .createHmac("sha512", "testkey")
  .update(expected)
  .digest("base64");
console.log("hash matches canonical concatenation:", expectHash === fields.hash);

// Pushback: sorted keys, values concatenated, HMAC-SHA512 base64
const body: Record<string, unknown> = {
  tran_id: "AUR-TEST-001",
  status: "0",
  apv: "APV123",
  return_params: "",
};
const toSign = Object.keys(body)
  .sort()
  .map((k) => String(body[k] ?? ""))
  .join("");
const sig = crypto.createHmac("sha512", "testkey").update(toSign).digest("base64");
console.log("pushback verify ok:", verifyPushback(body, sig));
console.log("pushback rejects bad sig:", !verifyPushback(body, "bogus"));
