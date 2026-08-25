import { Database, TriangleAlert } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DatabaseTestPage() {
  const hasEnvironment = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  let connectionError = "";
  let transactionCount = 0;

  if (hasEnvironment) {
    const supabase = await createClient();
    const result = await supabase.from("transactions").select("id", { count: "exact", head: true });
    transactionCount = result.count ?? 0;
    connectionError = result.error?.message ?? "";
  } else {
    connectionError = "Environment variables are missing. Copy .env.local.example to .env.local and add your Supabase values.";
  }

  const connected = hasEnvironment && !connectionError;

  return (
    <div className="min-h-screen bg-[#0c1118] text-white">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8f36b]">Phase 2 connection check</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Supabase database test</h1>
        <div className={`mt-10 rounded-2xl border p-8 ${connected ? "border-[#b8f36b]/30 bg-[#16211a]" : "border-amber-300/30 bg-amber-950/20"}`}>
          {connected ? <Database className="text-[#b8f36b]" size={30} /> : <TriangleAlert className="text-amber-300" size={30} />}
          <h2 className="mt-6 text-xl font-semibold">{connected ? "Connected successfully" : "Connection not ready"}</h2>
          <p className="mt-3 leading-7 text-slate-400">{connected ? `The server queried Supabase and found ${transactionCount} demo transaction${transactionCount === 1 ? "" : "s"}.` : connectionError}</p>
        </div>
        <p className="mt-8 text-sm text-slate-500">This temporary page is safe to remove after the dashboard is connected.</p>
      </main>
    </div>
  );
}
