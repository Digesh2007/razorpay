import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatINR } from "@/lib/utils";

export interface TransactionRowData {
  id: string;
  customerName: string;
  amount: number;
  failureReason: string;
  attempts: number;
  status: string;
  recommendation: string;
}

const reasonLabels: Record<string, string> = {
  BANK_TIMEOUT: "Bank timeout",
  UPI_FAILURE: "UPI failure",
  CARD_DECLINED: "Card declined",
  ABANDONED_CHECKOUT: "Abandoned checkout",
};

export function TransactionRow({ transaction }: { transaction: TransactionRowData }) {
  return (
    <TableRow>
      <TableCell><Link href={`/transactions/${transaction.id}`} className="font-mono text-xs text-[#b8f36b] hover:underline">{transaction.id.slice(0, 8)}...</Link></TableCell>
      <TableCell className="whitespace-nowrap font-medium text-white">{transaction.customerName}</TableCell>
      <TableCell className="whitespace-nowrap text-slate-300">{formatINR(transaction.amount)}</TableCell>
      <TableCell><Badge className="border-amber-300/20 bg-amber-300/10 text-amber-200">{reasonLabels[transaction.failureReason] ?? transaction.failureReason}</Badge></TableCell>
      <TableCell className="text-slate-400">{transaction.attempts}</TableCell>
      <TableCell><Badge className="border-red-300/20 bg-red-300/10 text-red-200">{transaction.status}</Badge></TableCell>
      <TableCell className="min-w-44 text-slate-400">{transaction.recommendation}</TableCell>
      <TableCell><ChevronRight size={17} className="text-slate-600" /></TableCell>
    </TableRow>
  );
}