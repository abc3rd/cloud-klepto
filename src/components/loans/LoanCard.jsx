import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChevronRight, Package } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { differenceInDays, parseISO, format } from "date-fns";

export default function LoanCard({ loan, currentUserEmail }) {
  const isLender = loan.lender_email === currentUserEmail;
  const otherParty = isLender ? loan.borrower_name : loan.lender_name;
  const roleLabel = isLender ? "Lent to" : "Borrowed from";

  const daysLoaned = differenceInDays(
    loan.return_date ? parseISO(loan.return_date) : new Date(),
    parseISO(loan.loan_date)
  );

  const daysUntilDue = differenceInDays(parseISO(loan.due_date), new Date());
  const isOverdue = daysUntilDue < 0 && loan.status === "active";

  return (
    <Link to={`/loan/${loan.id}`}>
      <Card className="p-4 hover:shadow-lg transition-all duration-300 border border-border/60 active:scale-[0.98]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
            {loan.item_photo ? (
              <img src={loan.item_photo} alt={loan.item_name} className="w-12 h-12 rounded-2xl object-cover" />
            ) : (
              <Package className="w-5 h-5 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm truncate">{loan.item_name}</h3>
              <StatusBadge status={isOverdue ? "overdue" : loan.status} />
            </div>

            <p className="text-xs text-muted-foreground mt-0.5">
              {roleLabel} <span className="font-medium text-foreground">{otherParty}</span>
            </p>

            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-muted-foreground">
                {daysLoaned} day{daysLoaned !== 1 ? "s" : ""} loaned
              </span>
              {loan.status === "active" && (
                <span className={`text-[11px] font-medium ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                  {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : `Due ${format(parseISO(loan.due_date), "MMM d")}`}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}