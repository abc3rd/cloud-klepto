import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle, RotateCcw, ShieldAlert, ShieldX } from "lucide-react";

const statusConfig = {
  active: { label: "Active", icon: Clock, className: "bg-primary/15 text-primary border-primary/30" },
  return_pending: { label: "Return Pending", icon: RotateCcw, className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  returned: { label: "Returned", icon: CheckCircle, className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  requested_back: { label: "Requested Back", icon: AlertTriangle, className: "bg-orange-500/15 text-orange-600 border-orange-500/30" },
  lost: { label: "Lost", icon: ShieldAlert, className: "bg-destructive/15 text-destructive border-destructive/30" },
  stolen: { label: "Stolen", icon: ShieldX, className: "bg-destructive/15 text-destructive border-destructive/30" },
  overdue: { label: "Overdue", icon: AlertTriangle, className: "bg-red-500/15 text-red-600 border-red-500/30" },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} gap-1 font-medium text-xs px-2.5 py-1 border`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}