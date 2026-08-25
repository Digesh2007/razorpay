import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard, Mail, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { AIDecisionCard } from "@/components/recovery/ai-decision-card";
import { AuditTimeline, type AuditEvent } from "@/components/recovery/audit-timeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface DetailPageProps { params: Promise<{ id: string }> }

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not recorded";
}

function paymentMethodFor(reason: string | null) {
  if (reason === "UPI_FAILURE") return "UPI";
  if (reason === "CARD_DECLINED") return "Card";
  if (reason === "BANK_TIMEOUT") return "NetBanking";
  return "Not recorded";
}

function customerTypeFor(successfulPayments: number, totalSpent: number) {
  if (successfulPayments >= 3 || totalSpent >= 50000) return "VIP";
  return successfulPayments > 0 ? "RETURNING" : "NEW";
}

export default async function TransactionDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const hasEnvironment = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!hasEnvironment) return <DetailShell><ErrorState message="Supabase environment variables are missing. Add them to .env.local." /></DetailShell>;

  const supabase = await createClient();
  const result = await supabase.from("transactions").select("id, customer_id, amount, currency, status, failure_reason, external_reference, created_at, customers(id, name, email, created_at), recovery_actions(id, strategy, status, details, executed_at, created_at), ai_decisions(id, recovery_probability, reasoning, model, created_at)").eq("id", id).single();
  if (result.error || !result.data) return <DetailShell><ErrorState message={result.error?.message ?? "Transaction not found."} /></DetailShell>;

  const transaction = result.data;
  const customer = Array.isArray(transaction.customers) ? transaction.customers[0] : transaction.customers;
  const actions = Array.isArray(transaction.recovery_actions) ? transaction.recovery_actions : [];
  const decisions = Array.isArray(transaction.ai_decisions) ? transaction.ai_decisions : [];
  const decision = decisions[decisions.length - 1];
  const historyResult = await supabase.from("transactions").select("amount, status").eq("customer_id", transaction.customer_id).neq("id", id);
  const history = historyResult.data ?? [];
  const successfulPayments = history.filter((item) => item.status === "recovered").length;
  const failedPayments = history.filter((item) => item.status === "failed" || item.status === "abandoned").length;
  const totalSpent = history.filter((item) => item.status === "recovered").reduce((sum, item) => sum + Number(item.amount), 0);
  const lastAction = actions[actions.length - 1];
  const probability = decision ? Number(decision.recovery_probability) : 0;
  const strategy = lastAction?.strategy ?? "stop";
  const reasoning = decision?.reasoning ?? "No AI analysis has been recorded for this transaction yet.";
  const auditEvents: AuditEvent[] = [{ title: "Payment failed", description: transaction.failure_reason ?? "Payment did not complete.", timestamp: formatDate(transaction.created_at), type: "failure" }];
  if (decision) { auditEvents.push({ title: "AI analyzed transaction", description: `${decision.model} evaluated recovery context.`, timestamp: formatDate(decision.created_at), type: "analysis" }, { title: `Decision: ${strategy.replaceAll("_", " ")}`, description: reasoning, timestamp: formatDate(decision.created_at), type: "decision" }); }
  if (lastAction) auditEvents.push({ title: "Recovery attempted", description: lastAction.details ?? `The ${lastAction.strategy.replaceAll("_", " ")} workflow was ${lastAction.status}.`, timestamp: formatDate(lastAction.executed_at ?? lastAction.created_at), type: "attempt" });
  if (transaction.status === "recovered") auditEvents.push({ title: "Payment recovered", description: "The simulated recovery flow completed successfully.", timestamp: formatDate(lastAction?.executed_at), type: "success" });

  return <DetailShell><Link href="/transactions" className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"><ArrowLeft size={16} /> Back to transactions</Link><div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="font-mono text-xs text-[#b8f36b]">{transaction.external_reference}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Transaction details</h1><p className="mt-3 text-slate-400">{formatDate(transaction.created_at)}</p></div><Badge className={transaction.status === "recovered" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-red-400/20 bg-red-400/10 text-red-300"}>{transaction.status}</Badge></div><div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"><div className="space-y-6"><Card><CardContent><SectionTitle icon={UserRound} title="Customer information" /><div className="mt-6 grid gap-5 sm:grid-cols-2"><Detail label="Customer ID" value={customer?.id?.slice(0, 12) ?? "Not recorded"} mono /><Detail label="Name" value={customer?.name ?? "Unknown customer"} /><Detail label="Email" value={customer?.email ?? "Not recorded"} /><Detail label="Customer type" value={customerTypeFor(successfulPayments, totalSpent)} /><Detail label="Previous successful payments" value={successfulPayments.toString()} /><Detail label="Previous failed payments" value={failedPayments.toString()} /><Detail label="Total spent" value={formatINR(totalSpent)} /></div></CardContent></Card><Card><CardContent><SectionTitle icon={CreditCard} title="Payment information" /><div className="mt-6 grid gap-5 sm:grid-cols-2"><Detail label="Transaction ID" value={transaction.id.slice(0, 12)} mono /><Detail label="Amount" value={formatINR(Number(transaction.amount))} /><Detail label="Payment method" value={paymentMethodFor(transaction.failure_reason)} /><Detail label="Timestamp" value={formatDate(transaction.created_at)} /><Detail label="Failure reason" value={transaction.failure_reason ?? "Not recorded"} /><Detail label="Attempt count" value={actions.length.toString()} /></div></CardContent></Card><Card><CardContent><h2 className="text-lg font-semibold">Recovery history</h2><Separator className="my-5" />{actions.length ? <div className="space-y-4">{actions.map((action) => <div key={action.id} className="flex items-start justify-between gap-4"><div><p className="font-medium capitalize text-white">{action.strategy.replaceAll("_", " ")}</p><p className="mt-1 text-sm text-slate-500">{action.details ?? "No additional details"}</p></div><Badge className="shrink-0 border-white/10 bg-white/5 capitalize text-slate-300">{action.status}</Badge></div>)}</div> : <p className="text-sm text-slate-500">No recovery attempts recorded.</p>}</CardContent></Card></div><div className="space-y-6"><AIDecisionCard probability={probability} strategy={strategy} reasoning={reasoning} nextSteps={lastAction?.details ?? "The agent will monitor this transaction and select the next safe action."} /><Card><CardContent><h2 className="text-lg font-semibold">Audit trail</h2><p className="mt-2 text-sm text-slate-500">Every decision is recorded for review.</p><Separator className="my-6" /><AuditTimeline events={auditEvents} /></CardContent></Card></div></div></DetailShell>;
}

function DetailShell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-[#0c1118] text-white"><SiteHeader /><main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">{children}</main></div>; }
function ErrorState({ message }: { message: string }) { return <Card className="mt-8 border-amber-300/20 bg-amber-950/20"><CardContent><div className="flex items-center gap-3 text-amber-200"><Mail size={18} /><p className="font-medium">Transaction details unavailable</p></div><p className="mt-3 text-sm text-amber-100/60">{message}</p></CardContent></Card>; }
function SectionTitle({ icon: Icon, title }: { icon: typeof UserRound; title: string }) { return <div className="flex items-center gap-3"><Icon size={19} className="text-[#b8f36b]" /><h2 className="text-lg font-semibold">{title}</h2></div>; }
function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div><p className="text-xs uppercase tracking-wider text-slate-500">{label}</p><p className={`mt-2 break-words text-sm text-slate-200 ${mono ? "font-mono" : ""}`}>{value}</p></div>; }