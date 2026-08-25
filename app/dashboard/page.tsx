import { Activity, CircleDollarSign, CircleX, IndianRupee, Percent, WalletCards } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { getServerSupabase } from "@/lib/supabase/server";
import { formatCompactINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const hasEnvironment = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  let errorMessage = "";
  let stats = { total: 0, failed: 0, recovered: 0, atRisk: 0, recoveredRevenue: 0 };

  if (!hasEnvironment) errorMessage = "Supabase environment variables are missing. Add them to .env.local.";
  else {
    const supabase = getServerSupabase();
    const result = await supabase.from("transactions").select("amount, status");
    if (result.error) errorMessage = result.error.message;
    else {
      const transactions = result.data ?? [];
      stats = transactions.reduce((summary, transaction) => {
        const amount = Number(transaction.amount);
        summary.total += 1;
        const status = String(transaction.status).toLowerCase();
        if (status === "failed" || status === "abandoned" || status === "pending_recovery" || status === "stopped") { summary.failed += 1; summary.atRisk += amount; }
        if (status === "recovered") { summary.recovered += 1; summary.recoveredRevenue += amount; }
        return summary;
      }, stats);
    }
  }

  const recoveryRate = stats.total ? Math.round((stats.recovered / stats.total) * 100) : 0;
  const cards = [
    { label: "Total transactions", value: stats.total.toString(), description: "All recorded demo activity", icon: Activity },
    { label: "Failed payments", value: stats.failed.toString(), description: "Needs recovery attention", icon: CircleX },
    { label: "Recovered payments", value: stats.recovered.toString(), description: "Successfully recovered", icon: CircleDollarSign, accent: true },
    { label: "Recovery rate", value: `${recoveryRate}%`, description: "Recovered of total transactions", icon: Percent, accent: true },
    { label: "Revenue at risk", value: formatCompactINR(stats.atRisk), description: "Failed and abandoned value", icon: WalletCards },
    { label: "Revenue recovered", value: formatCompactINR(stats.recoveredRevenue), description: "Value successfully recovered", icon: IndianRupee, accent: true },
  ];

  return <div className="min-h-screen bg-[#0c1118] text-white"><SiteHeader /><main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8f36b]">Merchant overview</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Recovery dashboard</h1><p className="mt-3 text-slate-400">A live view of your simulated payment recovery operation.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#b8f36b]/20 bg-[#b8f36b]/10 px-3 py-1.5 text-xs text-[#b8f36b]"><span className="size-1.5 rounded-full bg-[#b8f36b]" /> Demo mode</span></div>{errorMessage ? <Card className="mt-10 border-amber-300/20 bg-amber-950/20"><CardContent><p className="font-medium text-amber-200">Dashboard data is unavailable</p><p className="mt-2 text-sm text-amber-100/60">{errorMessage}</p></CardContent></Card> : <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map((card) => <StatsCard key={card.label} {...card} />)}</div>}<div className="mt-12 flex items-center justify-between border-b border-white/10 pb-4"><h2 className="text-lg font-semibold">Recovery activity</h2><span className="text-xs text-slate-500">Updated from Supabase</span></div><div className="mt-6 grid gap-4 md:grid-cols-3"><Card><CardContent><p className="text-sm text-slate-400">Next step</p><p className="mt-3 text-sm leading-6 text-slate-300">Review failed payments and let the AI agent prioritize the recovery queue.</p></CardContent></Card><Card><CardContent><p className="text-sm text-slate-400">Safety status</p><p className="mt-3 text-sm leading-6 text-[#b8f36b]">All actions are simulated in demo mode.</p></CardContent></Card><Card><CardContent><p className="text-sm text-slate-400">Recovery coverage</p><p className="mt-3 text-sm leading-6 text-slate-300">{stats.failed} transactions are waiting for an AI recommendation.</p></CardContent></Card></div></main></div>;
}