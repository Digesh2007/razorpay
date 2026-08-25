import { ArrowRight, BrainCircuit, CircleCheck, Clock3, Link2, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0c1118] text-white">
      <SiteHeader />
      <main>
        <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
          <div className="pointer-events-none absolute -right-48 top-0 size-[32rem] rounded-full bg-[#b8f36b]/[0.07] blur-3xl" />
          <div className="relative max-w-4xl">
            <p className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8f36b]"><span className="size-1.5 rounded-full bg-[#b8f36b]" /> Autonomous recovery engine</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-7xl lg:text-[6.25rem]">Turn failed payments into <span className="text-[#b8f36b]">recovered revenue.</span></h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-400">RecoverAI detects payment failures, chooses the smartest next move, and executes recovery workflows with a clear audit trail for every decision.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="#overview" className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#b8f36b] px-5 text-sm font-semibold text-[#0c1118] transition-transform hover:-translate-y-0.5">View the recovery engine <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></a>
              <span className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/10 px-5 text-sm text-slate-400"><span className="size-2 rounded-full bg-[#b8f36b] shadow-[0_0_10px_#b8f36b]" /> Live simulation ready</span>
            </div>
          </div>
        </section>

        <section id="overview" className="border-y border-white/10 bg-[#101720]">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">How it thinks</p>
              <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight text-white sm:text-4xl">One agent. Every recovery decision.</h2>
              <p className="mt-5 max-w-md leading-7 text-slate-400">A failed payment is a signal, not a dead end. RecoverAI turns that signal into an action plan tailored to the customer and the failure.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-[#0c1118] p-6"><BrainCircuit className="text-[#b8f36b]" size={24} /><h3 className="mt-8 font-semibold">Understand context</h3><p className="mt-2 text-sm leading-6 text-slate-500">Classifies the failure and estimates the probability of recovery.</p></div>
              <div className="rounded-xl border border-white/10 bg-[#0c1118] p-6"><RotateCcw className="text-[#b8f36b]" size={24} /><h3 className="mt-8 font-semibold">Choose the next move</h3><p className="mt-2 text-sm leading-6 text-slate-500">Selects retry, alternate payment, link, reminder, or stop.</p></div>
              <div className="rounded-xl border border-white/10 bg-[#0c1118] p-6"><CircleCheck className="text-[#b8f36b]" size={24} /><h3 className="mt-8 font-semibold">Execute and monitor</h3><p className="mt-2 text-sm leading-6 text-slate-500">Runs the workflow and watches for a successful recovery.</p></div>
              <div className="rounded-xl border border-white/10 bg-[#0c1118] p-6"><Clock3 className="text-[#b8f36b]" size={24} /><h3 className="mt-8 font-semibold">Explain every choice</h3><p className="mt-2 text-sm leading-6 text-slate-500">Keeps a human-readable audit trail from signal to outcome.</p></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24"><div className="flex flex-col justify-between gap-8 rounded-2xl border border-[#b8f36b]/20 bg-[#16211a] p-8 sm:p-12 lg:flex-row lg:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8f36b]">Built for trust</p><h2 className="mt-4 text-3xl font-semibold tracking-tight">Revenue recovery, without the black box.</h2><p className="mt-3 max-w-xl leading-7 text-slate-400">A test-only environment for demonstrating how intelligent payment operations can work.</p></div><div className="flex shrink-0 items-center gap-3 text-sm text-slate-300"><Link2 size={18} className="text-[#b8f36b]" /> 100% simulated actions</div></div></section>
      </main>
    </div>
  );
}
