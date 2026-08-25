import { ArrowLeft, ListFilter } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { TransactionTable } from "@/components/transactions/transaction-table";
import type { TransactionRowData } from "@/components/transactions/transaction-row";
import { Card, CardContent } from "@/components/ui/card";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const recommendations: Record<string, string> = { BANK_TIMEOUT: "Retry after cooldown", UPI_FAILURE: "Offer alternate payment", CARD_DECLINED: "Send payment link", ABANDONED_CHECKOUT: "Send reminder" };

export default async function TransactionsPage() {
  let errorMessage = "";
  let transactions: TransactionRowData[] = [];
  const hasEnvironment = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  if (!hasEnvironment) errorMessage = "Supabase environment variables are missing. Add them to .env.local.";
  else {
    const supabase = getServerSupabase();
    const result = await supabase.from("transactions").select("id, customer_id, amount, status, failure_reason").order("created_at", { ascending: false });
    if (result.error) errorMessage = result.error.message;
    else {
      const allTransactions = result.data ?? [];
      const failedTransactions = allTransactions.filter((transaction) => ["failed", "abandoned", "pending_recovery", "stopped"].includes(String(transaction.status).toLowerCase()));
      const customerIds = [...new Set(failedTransactions.map((transaction) => transaction.customer_id))];
      const customersResult = customerIds.length ? await supabase.from("customers").select("id, name").in("id", customerIds) : { data: [], error: null };
      const transactionIds = failedTransactions.map((transaction) => transaction.id);
      const actionsResult = transactionIds.length ? await supabase.from("recovery_actions").select("id, transaction_id").in("transaction_id", transactionIds) : { data: [], error: null };
      if (customersResult.error) errorMessage = customersResult.error.message;
      else if (actionsResult.error) errorMessage = actionsResult.error.message;
      else {
        const customerNames = new Map((customersResult.data ?? []).map((customer) => [customer.id, customer.name]));
        const attempts = new Map<string, number>();
        for (const action of actionsResult.data ?? []) attempts.set(action.transaction_id, (attempts.get(action.transaction_id) ?? 0) + 1);
        transactions = failedTransactions.map((transaction) => ({ id: transaction.id, customerName: customerNames.get(transaction.customer_id) ?? "Unknown customer", amount: Number(transaction.amount), failureReason: transaction.failure_reason ?? "UNKNOWN", attempts: attempts.get(transaction.id) ?? 0, status: transaction.status, recommendation: recommendations[transaction.failure_reason ?? ""] ?? "Review manually" }));
      }
    }
  }

  return <div className="min-h-screen bg-[#0c1118] text-white"><SiteHeader /><main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16"><Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"><ArrowLeft size={16} /> Back to dashboard</Link><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8f36b]">Recovery queue</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Failed transactions</h1><p className="mt-3 text-slate-400">Review payment failures waiting for an intelligent next step.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400"><ListFilter size={15} /> {transactions.length} records</span></div>{errorMessage ? <Card className="mt-10 border-amber-300/20 bg-amber-950/20"><CardContent><p className="font-medium text-amber-200">Transactions are unavailable</p><p className="mt-2 text-sm text-amber-100/60">{errorMessage}</p></CardContent></Card> : <div className="mt-10"><TransactionTable transactions={transactions} /></div>}<p className="mt-5 text-xs text-slate-600">AI recommendations are placeholders for Phase 3 and will become explainable agent decisions in Phase 4.</p></main></div>;
}