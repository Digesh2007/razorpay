import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const names = ["Aarav Mehta", "Ananya Iyer", "Rohan Kapoor", "Meera Nair", "Vikram Shah", "Ishita Rao", "Kabir Malhotra", "Priya Menon", "Arjun Bhat", "Diya Desai"];
const reasons = ["BANK_TIMEOUT", "UPI_FAILURE", "CARD_DECLINED", "ABANDONED_CHECKOUT"] as const;
const amounts = [499, 999, 2499, 4999, 9999, 14999, 24999];
const strategies = { BANK_TIMEOUT: "retry", UPI_FAILURE: "alternate_payment", CARD_DECLINED: "payment_link", ABANDONED_CHECKOUT: "reminder" } as const;
const reasoning = { BANK_TIMEOUT: "A temporary bank timeout is likely to resolve after a short cooldown.", UPI_FAILURE: "An alternate payment path can recover a UPI failure caused by a bank or app issue.", CARD_DECLINED: "A fresh payment link gives the customer another chance with a different instrument.", ABANDONED_CHECKOUT: "The customer showed purchase intent, so a timely reminder is appropriate." } as const;

function pick<T>(values: readonly T[]) { return values[Math.floor(Math.random() * values.length)]; }

export async function POST() {
  try {
    const supabase = getServerSupabase();
    const runId = Date.now().toString(36);
    const customers = Array.from({ length: 100 }, (_, index) => ({ name: pick(names), email: `demo-${runId}-${index}@recoverai.test`, phone: `+91 90000 ${String(index).padStart(5, "0")}` }));
    const customersResult = await supabase.from("customers").insert(customers).select("id, name");
    if (customersResult.error || !customersResult.data) throw new Error(customersResult.error?.message ?? "Could not create demo customers.");

    const transactions = customersResult.data.map((customer, index) => {
      const failureReason = pick(reasons);
      const recovered = Math.random() < 0.7;
      return { customer_id: customer.id, amount: pick(amounts), currency: "INR", status: recovered ? "recovered" : "failed", failure_reason: failureReason, external_reference: `SIM_${runId}_${String(index + 1).padStart(3, "0")}` };
    });
    const transactionsResult = await supabase.from("transactions").insert(transactions).select("id, amount, status, failure_reason");
    if (transactionsResult.error || !transactionsResult.data) throw new Error(transactionsResult.error?.message ?? "Could not create demo transactions.");

    const actions = transactionsResult.data.map((transaction) => ({ transaction_id: transaction.id, strategy: strategies[transaction.failure_reason as keyof typeof strategies], status: transaction.status === "recovered" ? "succeeded" : "queued", details: reasoning[transaction.failure_reason as keyof typeof reasoning], executed_at: transaction.status === "recovered" ? new Date().toISOString() : null }));
    const actionsResult = await supabase.from("recovery_actions").insert(actions).select("id, transaction_id");
    if (actionsResult.error || !actionsResult.data) throw new Error(actionsResult.error?.message ?? "Could not create recovery actions.");

    const actionByTransaction = new Map(actionsResult.data.map((action) => [action.transaction_id, action.id]));
    const decisions = transactionsResult.data.map((transaction) => ({ transaction_id: transaction.id, recovery_action_id: actionByTransaction.get(transaction.id), recovery_probability: transaction.status === "recovered" ? Math.floor(70 + Math.random() * 25) : Math.floor(25 + Math.random() * 40), reasoning: reasoning[transaction.failure_reason as keyof typeof reasoning], model: "demo-simulation-engine" }));
    const decisionsResult = await supabase.from("ai_decisions").insert(decisions);
    if (decisionsResult.error) throw new Error(decisionsResult.error.message);

    const recovered = transactionsResult.data.filter((transaction) => transaction.status === "recovered");
    return NextResponse.json({ total: transactionsResult.data.length, recovered: recovered.length, failed: transactionsResult.data.length - recovered.length, revenueRecovered: recovered.reduce((sum, transaction) => sum + Number(transaction.amount), 0) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The simulation could not be completed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}