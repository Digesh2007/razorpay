import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const contentType = request.headers.get("content-type") ?? "";
    const body = contentType.includes("application/x-www-form-urlencoded")
      ? Object.fromEntries(new URLSearchParams(await request.text()).entries())
      : await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    const externalReference = body.externalReference ?? requestUrl.searchParams.get("externalReference");
    const transaction_id = body.transaction_id ?? requestUrl.searchParams.get("transaction_id");
    const transactionReference = externalReference ?? transaction_id;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !transactionReference) return NextResponse.json({ success: false, error: "Incomplete payment confirmation." }, { status: 400 });
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ success: false, error: "Razorpay is not configured." }, { status: 503 });
    const expectedSignature = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (expectedSignature !== razorpay_signature) return NextResponse.json({ success: false, error: "Invalid payment signature." }, { status: 401 });
    const query = getServerSupabase().from("transactions").update({ status: "recovered" }).select("id, status");
    const result = transaction_id ? await query.eq("id", transaction_id).single() : await query.eq("external_reference", transactionReference).single();
    if (result.error || !result.data) throw new Error(result.error?.message ?? "Transaction was not found.");
    if (contentType.includes("application/x-www-form-urlencoded")) return NextResponse.redirect(new URL(`/transactions/${result.data.id}`, request.url), 303);
    return NextResponse.json({ success: true, received: true, payment_id: razorpay_payment_id, transaction: result.data });
  } catch (error) {
    console.error("Payment confirmation error", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not confirm payment." }, { status: 500 });
  }
}