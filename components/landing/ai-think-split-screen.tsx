"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BrainCircuit, CreditCard, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const logs = [
  "[00:01] Analyzing failure context...",
  "[00:02] Customer LTV: High. Failure type: Soft decline.",
  "[00:03] Strategy selected: Wait 24h, then Smart Retry.",
  "[00:04] Workflow executed. Awaiting result.",
];

export function AIThinkSplitScreen() {
  const [visibleLogs, setVisibleLogs] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setVisibleLogs((value) => Math.min(value + 1, logs.length)), 850);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="think" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
      <div className="mb-12 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1950E4]">See the AI think</p>
        <h2 className="mt-4 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Every decision has a reason.</h2>
        <p className="mt-5 text-lg leading-8 text-zinc-500 dark:text-zinc-400">Watch one failed payment move from signal to strategy, with the full reasoning visible as it happens.</p>
      </div>
      <div className="grid overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(16,24,40,.1)] dark:border-zinc-800 dark:bg-zinc-950 lg:grid-cols-[.85fr_1.15fr]">
        <div className="relative overflow-hidden bg-[#111827] p-7 text-white sm:p-10">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-[#1950E4]/25 blur-3xl" />
          <div className="relative flex items-center justify-between text-xs text-zinc-400"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#f04438]" /> Payment failure detected</span><span className="rounded-full border border-white/10 px-2 py-1">LIVE</span></div>
          <div className="relative mt-14"><div className="flex size-14 items-center justify-center rounded-2xl bg-[#f04438]/15 text-[#f97066]"><AlertTriangle size={26} /></div><p className="mt-8 text-xs font-semibold uppercase tracking-[.16em] text-zinc-500">Transaction status</p><h3 className="mt-2 text-2xl font-bold">Error 402: Insufficient Funds</h3><p className="mt-3 text-sm text-zinc-400">The issuer declined this authorization. RecoverAI is on it.</p></div>
          <div className="relative mt-14 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm"><div><p className="text-xs text-zinc-500">Payment method</p><p className="mt-1 flex items-center gap-2 font-semibold"><CreditCard size={15} /> Visa ending 4242</p></div><div><p className="text-xs text-zinc-500">Amount</p><p className="mt-1 font-semibold">$49.00 USD</p></div></div>
        </div>
        <div className="bg-zinc-950 p-7 font-mono text-sm text-zinc-300 sm:p-10"><div className="flex items-center gap-3 border-b border-white/10 pb-5 font-sans"><span className="flex size-9 items-center justify-center rounded-xl bg-[#1950E4]/15 text-[#6f96ff]"><BrainCircuit size={18} /></span><div><p className="font-semibold text-white">RecoverAI reasoning engine</p><p className="text-xs text-zinc-500">Transparent workflow trace</p></div><span className="ml-auto flex items-center gap-1.5 text-xs text-[#32d583]"><span className="size-1.5 animate-pulse rounded-full bg-[#32d583]" /> streaming</span></div><div className="min-h-[250px] space-y-5 pt-8">{logs.slice(0, visibleLogs).map((log, index) => <motion.p key={log} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={index === 2 ? "text-[#8fb0ff]" : "text-zinc-400"}><span className="mr-3 text-zinc-700">›</span>{log}</motion.p>)}{visibleLogs < logs.length && <span className="inline-block h-4 w-2 animate-pulse bg-[#1950E4]" />}</div><div className="mt-8 flex items-center gap-2 border-t border-white/10 pt-5 font-sans text-xs text-zinc-500"><ShieldCheck size={15} className="text-[#32d583]" /> Every action is logged and explainable</div></div>
      </div>
    </section>
  );
}
