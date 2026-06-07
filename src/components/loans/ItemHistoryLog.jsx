import { Card } from "@/components/ui/card";
import { History, User, ArrowUpRight, CheckCircle, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import StatusBadge from "./StatusBadge";

export default function ItemHistoryLog({ allLoans, currentLoanId, itemName }) {
  // Find all loans with the same item name (case-insensitive)
  const history = allLoans
    .filter(
      (l) =>
        l.item_name?.toLowerCase() === itemName?.toLowerCase() &&
        l.id !== currentLoanId
    )
    .sort((a, b) => new Date(b.loan_date) - new Date(a.loan_date));

  if (history.length === 0) return null;

  return (
    <Card className="border-border/50 overflow-hidden">
      <div className="p-4 pb-2 flex items-center gap-2">
        <History className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold">Item History</p>
        <span className="text-xs text-muted-foreground ml-auto">{history.length} past loan{history.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="divide-y divide-border/50">
        {history.map((loan) => (
          <div key={loan.id} className="px-4 py-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary font-bold text-xs">{loan.borrower_name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">{loan.borrower_name}</p>
                <StatusBadge status={loan.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(parseISO(loan.loan_date), "MMM d, yyyy")}
                {loan.return_date && ` → ${format(parseISO(loan.return_date), "MMM d, yyyy")}`}
              </p>
              {loan.condition_at_return && (
                <p className="text-xs text-muted-foreground capitalize">
                  Returned: {loan.condition_at_return.replace("_", " ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}