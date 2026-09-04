import { Inbox } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TransactionRow, type TransactionRowData } from "@/components/transactions/transaction-row";

export function TransactionTable({ transactions }: { transactions: TransactionRowData[] }) {
  if (transactions.length === 0) {
    return <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center"><Inbox className="text-slate-600" size={30} /><p className="mt-4 font-medium text-slate-300">No failed transactions</p><p className="mt-1 text-sm text-slate-500">Your recovery queue is clear.</p></div>;
  }

  return <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#111a23]"><Table><TableHeader><TableRow className="hover:bg-transparent"><TableHead>Transaction ID</TableHead><TableHead>Customer</TableHead><TableHead>Amount</TableHead><TableHead>Failure reason</TableHead><TableHead>Attempts</TableHead><TableHead>Status</TableHead><TableHead>AI recommendation</TableHead><TableHead aria-label="Open transaction" /></TableRow></TableHeader><TableBody>{transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}</TableBody></Table></div>;
}