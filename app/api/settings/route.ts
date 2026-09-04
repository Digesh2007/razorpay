import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const maxRetryAttempts = Number(body.maxRetryAttempts);
    const minConfidenceThreshold = Number(body.minConfidenceThreshold);
    if (!Number.isInteger(maxRetryAttempts) || maxRetryAttempts < 1 || maxRetryAttempts > 5 || !Number.isInteger(minConfidenceThreshold) || minConfidenceThreshold < 50 || minConfidenceThreshold > 95) return NextResponse.json({ error: "Settings values are outside the allowed range." }, { status: 400 });
    const supabase = getServerSupabase();
    const values = { max_retry_attempts: maxRetryAttempts, min_confidence_threshold: minConfidenceThreshold, recovery_enabled: Boolean(body.autoRecoveryEnabled), alternate_payment_enabled: Boolean(body.alternatePaymentEnabled), payment_link_enabled: Boolean(body.paymentLinkEnabled), notifications_enabled: Boolean(body.notificationsEnabled), updated_at: new Date().toISOString() };
    const existing = await supabase.from("merchant_settings").select("id").eq("merchant_name", "RecoverAI Demo Store").maybeSingle();
    if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 500 });
    const result = existing.data
      ? await supabase.from("merchant_settings").update(values).eq("id", existing.data.id).select().single()
      : await supabase.from("merchant_settings").insert({ merchant_name: "RecoverAI Demo Store", default_currency: "INR", ...values }).select().single();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ settings: result.data });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save settings." }, { status: 500 }); }
}