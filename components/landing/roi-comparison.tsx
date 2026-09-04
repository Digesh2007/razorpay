"use client";

import { ArrowUp, Clock3, HeartCrack, Percent, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const before = [{ icon: Percent, value: "12%", label: "recovery" }, { icon: Clock3, value: "3-day", label: "response" }, { icon: HeartCrack, value: "High", label: "churn" }];
const after = [{ icon: Percent, value: "34%", label: "recovery" }, { icon: Clock3, value: "<2s", label: "response" }, { icon: ShieldCheck, value: "Zero", label: "churn" }];

function Metric({ item, positive }: { item: (typeof before)[number]; positive?: boolean }) {
  const Icon = item.icon;
  return <div className="flex items-center gap-3 border-t border-current/10 py-4"><Icon size={17} className="opacity-70" /><div><p className="text-2xl font-bold tracking-tight">{item.value}</p><p className="text-xs capitalize opacity-60">{item.label}</p></div>{positive && <ArrowUp size={15} className="ml-auto text-[#32d583]" />}</div>;
}

export function ROIComparison() {
  return <section id="roi" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1950E4]">The measurable difference</p><h2 className="mt-4 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Stop treating revenue recovery like a support ticket.</h2></div><p className="max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-400">Autonomous decisions compound into better retention and a healthier payment operation.</p></div><div className="mt-14 grid gap-4 md:grid-cols-2"><motion.div whileHover={{ y: -4 }} className="rounded-3xl border border-[#fecdca] bg-[#fff8f7] p-7 text-[#b42318] sm:p-9 dark:border-[#5d2826] dark:bg-[#241516]"><p className="text-xs font-bold uppercase tracking-[.16em] opacity-70">Before</p><h3 className="mt-3 text-2xl font-bold text-[#7a271a] dark:text-[#fda29b]">Manual Dunning</h3><p className="mt-3 text-sm opacity-75">Reactive workflows, slow handoffs, and a customer experience that feels like a dead end.</p><div className="mt-10">{before.map((item) => <Metric item={item} key={item.label} />)}</div></motion.div><motion.div whileHover={{ y: -4 }} className="rounded-3xl border border-[#b7ebcd] bg-[#f3fdf7] p-7 text-[#027a48] shadow-[0_20px_50px_rgba(18,183,106,.08)] sm:p-9 dark:border-[#1d6044] dark:bg-[#10251d]"><p className="text-xs font-bold uppercase tracking-[.16em] opacity-70">After</p><h3 className="mt-3 text-2xl font-bold text-[#05603a] dark:text-[#6ce9a6]">RecoverAI Autonomous</h3><p className="mt-3 text-sm opacity-75">Context-aware decisions, instant action, and a recovery experience built around the customer.</p><div className="mt-10">{after.map((item) => <Metric item={item} positive key={item.label} />)}</div></motion.div></div></section>;
}
