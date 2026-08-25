import { BarChart3, Database, TriangleAlert } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { Card, CardContent } from "@/components/ui/card";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AnalyticsData = {
  recoveryOverTime: { day: string; rate: number }[];
  revenueByDay: { day: string; recovered: number }[];
  failureReasons: { name: string; value: number }[];
};

const emptyData: AnalyticsData = { recoveryOverTime: [], revenueByDay: [], failureReasons: [] };

export default async function AnalyticsPage() {
  let data = emptyData;
  let errorMessage = "";
  const hasEnvironment = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));

  if (!hasEnvironment) errorMessage = "Supabase environment variables are missing. Add them to .env.local.";
  else {
    const supabase = getServerSupabase();
    const result = await supabase.from("transactions").select("amount, status, failure_reason, created_at").order("created_at", { ascending: true });
    if (result.error) errorMessage = result.error.message;
    else {
      const transactions = result.data ?? [];
      const daily = new Map<string, { recovered: number; total: number }>();
      const reasons = new Map<string, number>();
      for (const transaction of transactions) {
        const date = new Date(transaction.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        const current = daily.get(date) ?? { recovered: 0, total: 0 };
        current.total += 1;
        if (String(transaction.status).toLowerCase() === "recovered") current.recovered += 1;
        daily.set(date, current);
        if (transaction.failure_reason) reasons.set(transaction.failure_reason, (reasons.get(transaction.failure_reason) ?? 0) + 1);
      }
      data = { recoveryOverTime: [...daily].map(([day, values]) => ({ day, rate: values.total ? Math.round((values.recovered / values.total) * 100) : 0 })), revenueByDay: [...daily].map(([day]) => ({ day, recovered: transactions.filter((transaction) => new Date(transaction.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) === day && String(transaction.status).toLowerCase() === "recovered").reduce((sum, transaction) => sum + Number(transaction.amount), 0) })), failureReasons: [...reasons].map(([name, value]) => ({ name, value })) };
    }
  }

  return <div className="min-h-screen bg-[#0c1118] text-white"><SiteHeader /><main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8f36b]"><BarChart3 size={15} /> Performance intelligence</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Analytics</h1><p className="mt-3 text-slate-400">See where the recovery engine is creating measurable impact.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#b8f36b]/20 bg-[#b8f36b]/10 px-3 py-1.5 text-xs text-[#b8f36b]"><Database size={14} /> Live database</span></div>{errorMessage ? <Card className="mt-10 border-amber-300/20 bg-amber-950/20"><CardContent><div className="flex items-center gap-3 text-amber-200"><TriangleAlert size={18} /><p className="font-medium">Analytics data unavailable</p></div><p className="mt-3 text-sm text-amber-100/60">{errorMessage}</p></CardContent></Card> : data.recoveryOverTime.length === 0 ? <Card className="mt-10 border-dashed border-white/10"><CardContent><p className="font-medium text-slate-300">No analytics data yet</p><p className="mt-2 text-sm text-slate-500">Run the simulator to populate the charts with demo activity.</p></CardContent></Card> : <div className="mt-10"><AnalyticsCharts data={data} /></div>}</main></div>;
}