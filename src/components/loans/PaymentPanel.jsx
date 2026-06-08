import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Clock, Plus, X } from "lucide-react";
import { format, parseISO } from "date-fns";

const methodLabels = {
  venmo: "Venmo", cashapp: "Cash App", paypal: "PayPal",
  zelle: "Zelle", cash: "Cash", other: "Other"
};
const typeLabels = {
  one_time: "One-time", lease_monthly: "Monthly Lease", lease_weekly: "Weekly Lease",
  late_fee: "Late Fee", damage_fee: "Damage Fee", settlement: "Settlement"
};

export default function PaymentPanel({ loan, currentUserEmail }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("one_time");
  const [method, setMethod] = useState("venmo");
  const [note, setNote] = useState("");

  const isLender = loan.lender_email === currentUserEmail;

  const { data: payments = [] } = useQuery({
    queryKey: ["payments", loan.id],
    queryFn: () => base44.entities.LeasePayment.filter({ loan_id: loan.id }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LeasePayment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", loan.id] });
      setShowForm(false);
      setAmount(""); setNote("");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => base44.entities.LeasePayment.update(id, {
      status: "confirmed",
      paid_date: format(new Date(), "yyyy-MM-dd"),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments", loan.id] }),
  });

  const handleSubmit = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    createMutation.mutate({
      loan_id: loan.id,
      payer_email: isLender ? loan.borrower_email : currentUserEmail,
      payer_name: isLender ? loan.borrower_name : loan.borrower_name,
      payee_email: loan.lender_email,
      payee_name: loan.lender_name,
      item_name: loan.item_name,
      amount: parseFloat(amount),
      payment_type: type,
      payment_method: method,
      status: "pending",
      note,
      due_date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const totalPaid = payments.filter((p) => p.status === "confirmed").reduce((a, p) => a + (p.amount || 0), 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((a, p) => a + (p.amount || 0), 0);

  return (
    <Card className="border-border/50 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Payments</span>
        </div>
        <div className="flex items-center gap-3">
          {totalPaid > 0 && (
            <span className="text-xs text-emerald-600 font-semibold">${totalPaid.toFixed(2)} paid</span>
          )}
          {totalPending > 0 && (
            <span className="text-xs text-yellow-600 font-semibold">${totalPending.toFixed(2)} pending</span>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="w-7 h-7 rounded-full"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="p-4 border-b border-border/40 space-y-3 bg-accent/20">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 rounded-xl bg-background border-border text-sm pl-7"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-10 rounded-xl bg-background border-border text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-time Pay</SelectItem>
                  <SelectItem value="lease_monthly">Monthly Lease</SelectItem>
                  <SelectItem value="lease_weekly">Weekly Lease</SelectItem>
                  <SelectItem value="late_fee">Late Fee</SelectItem>
                  <SelectItem value="damage_fee">Damage Fee</SelectItem>
                  <SelectItem value="settlement">Settlement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Via</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="h-10 rounded-xl bg-background border-border text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="cashapp">Cash App</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="zelle">Zelle</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Note</Label>
              <Input
                placeholder="Optional..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-10 rounded-xl bg-background border-border text-xs"
              />
            </div>
          </div>
          <Button
            className="w-full h-10 rounded-xl text-sm bg-primary gap-2"
            onClick={handleSubmit}
            disabled={!amount || createMutation.isPending}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Record Payment
          </Button>
        </div>
      )}

      {/* Payment history */}
      <div className="divide-y divide-border/40">
        {payments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No payments recorded yet.</p>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                p.status === "confirmed" ? "bg-emerald-500/10" : "bg-yellow-500/10"
              }`}>
                {p.status === "confirmed"
                  ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                  : <Clock className="w-4 h-4 text-yellow-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold">${p.amount?.toFixed(2)}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{methodLabels[p.payment_method] || p.payment_method}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{typeLabels[p.payment_type] || p.payment_type}{p.note ? ` · ${p.note}` : ""}</p>
                {p.paid_date && <p className="text-[10px] text-muted-foreground">{format(parseISO(p.paid_date), "MMM d, yyyy")}</p>}
              </div>
              {isLender && p.status === "pending" && (
                <Button
                  size="sm"
                  className="h-7 px-2.5 rounded-lg text-xs bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                  variant="ghost"
                  onClick={() => confirmMutation.mutate(p.id)}
                >
                  Confirm
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}