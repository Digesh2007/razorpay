import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getRazorpayWebhookSecret } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

function isValidSignature(body: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");
  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  try {
    if (!signature || !isValidSignature(body, signature, getRazorpayWebhookSecret())) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const event = JSON.parse(body) as { event?: string; payload?: { payment?: { entity?: { notes?: Record<string, string> } } } };
    const payment = event.payload?.payment?.entity;
    const externalReference = payment?.notes?.external_reference;

    if (externalReference && (event.event === "payment.captured" || event.event === "payment.failed")) {
      const status = event.event === "payment.captured" ? "recovered" : "failed";
      const result = await getServerSupabase().from("transactions").update({ status }).eq("external_reference", externalReference);
      if (result.error) throw new Error(result.error.message);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not process Razorpay webhook.";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}