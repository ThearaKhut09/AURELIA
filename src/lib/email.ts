// Transactional email via Resend REST API (no SDK dependency).
// No-ops quietly when RESEND_API_KEY is not configured.
import { formatUsd, formatKhr, usdToKhr } from "@/lib/currency";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface OrderEmailData {
  tranId: string;
  contactName: string;
  contactEmail: string;
  totalUsd: number;
  items: Array<{ name: string; variantName?: string | null; quantity: number; priceUsd: number }>;
}

export async function sendOrderConfirmation(order: OrderEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.log(`[email] RESEND_API_KEY not set — skipping confirmation for ${order.tranId}`);
    return;
  }

  const lines = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0">${i.name}${i.variantName ? ` — ${i.variantName}` : ""} × ${i.quantity}</td>` +
        `<td align="right" style="padding:8px 0">${formatUsd(i.priceUsd * i.quantity)}</td></tr>`,
    )
    .join("");

  const html = `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1C1F26">
    <p style="letter-spacing:6px;font-size:13px;color:#7C8B76">AURELIA</p>
    <h1 style="font-size:26px;font-weight:400">Thank you, ${escapeHtml(order.contactName)}</h1>
    <p>Your order <strong>${escapeHtml(order.tranId)}</strong> is confirmed and being prepared.</p>
    <table style="width:100%;border-collapse:collapse;font-family:Helvetica,Arial,sans-serif;font-size:14px">
      ${lines}
      <tr><td style="padding:8px 0;border-top:1px solid #e5e0d8"><strong>Total</strong></td>
      <td align="right" style="padding:8px 0;border-top:1px solid #e5e0d8"><strong>${formatUsd(order.totalUsd)} · ${formatKhr(usdToKhr(order.totalUsd))}</strong></td></tr>
    </table>
    <p style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#4A4F5A">
      Track your order any time in your AURELIA account. Questions? Reply to this email.
    </p>
  </div>`;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: order.contactEmail,
        subject: `Your AURELIA order ${order.tranId} is confirmed`,
        html,
      }),
    });
    if (!res.ok) console.error("[email] Resend error:", await res.text());
  } catch (error) {
    console.error("[email] send failed:", error);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
