import { Card } from "@/components/ui/card";
import { ArrowUpRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function QuickStats({ loans, userEmail }) {
  const myLoans = loans.filter(
    (l) => l.lender_email === userEmail || l.borrower_email === userEmail
  );

  const outNow = myLoans.filter((l) =>
    ["active", "overdue", "requested_back", "return_pending"].includes(l.status)
  ).length;

  const overdue = myLoans.filter((l) => {
    if (!["active", "overdue"].includes(l.status)) return false;
    return new Date(l.due_date) < new Date();
  }).length;

  const returnedThisMonth = myLoans.filter((l) => {
    if (l.status !== "returned" || !l.return_date) return false;
    const r = new Date(l.return_date);
    const now = new Date();
    return r.getMonth() === now.getMonth() && r.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: "Out Now", value: outNow, icon: ArrowUpRight, color: "text-primary", bg: "bg-primary/10" },
    { label: "Overdue", value: overdue, icon: AlertTriangle, color: overdue > 0 ? "text-destructive" : "text-muted-foreground", bg: overdue > 0 ? "bg-destructive/10" : "bg-muted" },
    { label: "Returned", value: returnedThisMonth, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500/10", sub: "this mo." },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 mb-5">
      {stats.map(({ label, value, icon: Icon, color, bg, sub }) => (
        <Card key={label} className="p-3 border-border/50 flex flex-col gap-1.5">
          <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${color}`} />
          </div>
          <p className={`text-xl font-black ${color}`}>{value}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{label}{sub ? <><br />{sub}</> : ""}</p>
        </Card>
      ))}
    </div>
  );
}