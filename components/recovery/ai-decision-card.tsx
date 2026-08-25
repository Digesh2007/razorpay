import { Brain, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIDecisionCardProps {
  probability: number;
  strategy: string;
  reasoning: string;
  nextSteps: string;
}

function confidenceFor(probability: number) {
  if (probability >= 70) return { label: "High confidence", className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300", bar: "bg-emerald-500" };
  if (probability >= 40) return { label: "Medium confidence", className: "border-amber-400/20 bg-amber-400/10 text-amber-300", bar: "bg-amber-500" };
  return { label: "Low confidence", className: "border-red-400/20 bg-red-400/10 text-red-300", bar: "bg-red-500" };
}

export function AIDecisionCard({ probability, strategy, reasoning, nextSteps }: AIDecisionCardProps) {
  const confidence = confidenceFor(probability);
  return <Card className="border-[#b8f36b]/20 bg-[#16211a]"><CardContent><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-[#b8f36b]/10"><Brain size={21} className="text-[#b8f36b]" /></span><div><p className="text-xs uppercase tracking-wider text-slate-500">AI recommendation</p><p className="mt-1 text-lg font-semibold uppercase text-white">{strategy.replaceAll("_", " ")}</p></div></div><Badge className={confidence.className}>{confidence.label}</Badge></div><div className="mt-8 flex items-end justify-between"><div><p className="text-sm text-slate-400">Recovery probability</p><p className="mt-1 text-4xl font-semibold text-[#b8f36b]">{probability}%</p></div><span className="text-sm text-slate-500">{confidence.label}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${confidence.bar}`} style={{ width: `${Math.min(100, Math.max(0, probability))}%` }} /></div><div className="mt-8 border-t border-white/10 pt-6"><div className="flex items-start gap-3"><Lightbulb size={18} className="mt-0.5 shrink-0 text-amber-300" /><div><p className="font-medium text-white">Why?</p><p className="mt-2 text-sm leading-6 text-slate-400">{reasoning}</p></div></div><p className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Next steps</p><p className="mt-2 text-sm leading-6 text-slate-300">{nextSteps}</p></div></CardContent></Card>;
}