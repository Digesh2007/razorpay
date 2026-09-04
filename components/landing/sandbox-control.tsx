"use client";

import { motion } from "framer-motion";
import { ChevronDown, Play, RotateCcw, Terminal } from "lucide-react";
import { useState } from "react";

const options = ["Insufficient Funds", "Expired Card", "Fraud Block"];

export function SandboxControl() {
  const [failure, setFailure] = useState(options[0]);
  const [running, setRunning] = useState(false);

  function trigger() {
    setRunning(true);
    window.setTimeout(() => setRunning(false), 900);
  }

  return <section id="sandbox" className="border-t border-zinc-200 bg-[#f5f7fb] dark:border-zinc-800 dark:bg-[#0c1018]"><div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1950E4]">Interactive sandbox</p><h2 className="mt-4 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Put the agent in motion.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-zinc-500 dark:text-zinc-400">Test the recovery engine in a zero-risk environment. Choose a failure and trigger a simulated workflow.</p></div><div className="flex items-center gap-3 rounded-full border border-[#b7ebcd] bg-white px-4 py-2.5 text-sm font-semibold text-[#027a48] shadow-sm dark:bg-zinc-950"><span className="size-2 animate-pulse rounded-full bg-[#12b76a]" />💸 $142,500 Recovered in this session</div></div><div className="mt-14 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_24px_70px_rgba(16,24,40,.08)] dark:border-zinc-800 dark:bg-zinc-950"><div className="flex flex-col gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-[#1950E4]/10 text-[#1950E4]"><Terminal size={18} /></span><span className="text-sm font-bold">Simulation control panel</span></div><label className="relative flex items-center"><select value={failure} onChange={(event) => setFailure(event.target.value)} className="h-11 appearance-none rounded-xl border border-zinc-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-zinc-700 outline-none focus:border-[#1950E4] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 text-zinc-400" /></label></div><div className="flex min-h-[330px] flex-col items-center justify-center px-6 py-16 text-center"><motion.button onClick={trigger} disabled={running} animate={running ? { scale: [1, 1.04, 1] } : { scale: 1 }} transition={{ repeat: running ? Infinity : 0, duration: .8 }} className="group relative flex size-36 flex-col items-center justify-center rounded-full bg-[#1950E4] text-white shadow-[0_0_0_14px_rgba(25,80,228,.08),0_18px_35px_rgba(25,80,228,.25)] transition hover:bg-[#123fb9] disabled:cursor-wait disabled:opacity-80"><Play size={25} fill="currentColor" /><span className="mt-2 text-xs font-bold">{running ? "Running..." : "Trigger Simulation"}</span></motion.button><p className="mt-9 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Ready to simulate: {failure}</p><p className="mt-2 max-w-sm text-xs leading-5 text-zinc-500">Your test will generate a decision, execute the selected workflow, and log the outcome.</p></div><div className="flex items-center justify-center gap-2 border-t border-zinc-200 py-4 text-xs text-zinc-500 dark:border-zinc-800"><RotateCcw size={14} /> All activity is simulated. No real payments are processed.</div></div></div></section>;
}
