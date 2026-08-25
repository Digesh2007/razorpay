import { Settings as SettingsIcon, ShieldCheck, TriangleAlert } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const defaults = { maxRetryAttempts: 3, minConfidenceThreshold: 70, autoRecoveryEnabled: true, alternatePaymentEnabled: true, paymentLinkEnabled: true, notificationsEnabled: true };

export default async function SettingsPage() {
  let initialSettings = defaults;
  let errorMessage = "";
  try { const supabase = getServerSupabase(); const result = await supabase.from("merchant_settings").select("max_retry_attempts, min_confidence_threshold, recovery_enabled, alternate_payment_enabled, payment_link_enabled, notifications_enabled").eq("merchant_name", "RecoverAI Demo Store").maybeSingle(); if (result.error) errorMessage = result.error.message; else if (result.data) initialSettings = { maxRetryAttempts: result.data.max_retry_attempts, minConfidenceThreshold: result.data.min_confidence_threshold, autoRecoveryEnabled: result.data.recovery_enabled, alternatePaymentEnabled: result.data.alternate_payment_enabled, paymentLinkEnabled: result.data.payment_link_enabled, notificationsEnabled: result.data.notifications_enabled }; } catch (error) { errorMessage = error instanceof Error ? error.message : "Could not load settings."; }
  return <div className="min-h-screen bg-[#0c1118] text-white"><SiteHeader /><main className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-16"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8f36b]"><SettingsIcon size={15} /> Agent configuration</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Settings</h1><p className="mt-3 text-slate-400">Tune the guardrails that guide autonomous recovery.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#b8f36b]/20 bg-[#b8f36b]/10 px-3 py-1.5 text-xs text-[#b8f36b]"><ShieldCheck size={14} /> DEMO / TEST ENVIRONMENT</span></div>{errorMessage ? <div className="mt-10 flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-950/20 p-5 text-sm text-amber-200"><TriangleAlert size={18} className="shrink-0" />Settings could not be loaded: {errorMessage}</div> : <SettingsForm initialSettings={initialSettings} />}</main></div>;
}