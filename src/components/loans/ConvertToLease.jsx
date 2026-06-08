import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, DollarSign, CheckCircle } from "lucide-react";
import { format, addMonths, addWeeks } from "date-fns";

export default function ConvertToLease({ loan, onClose }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("lease_monthly");
  const [method, setMethod] = useState("venmo");
  const [note, setNote] = useState("");

  const createPayment = useMutation({
    mutationFn: (data) => base44.entities.LeasePayment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", loan.id] });
    },
  });

  const updateLoan = useMutation({
    mutationFn: (data) => base44.entities.LoanItem.update(loan.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan", loan.id] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });

  const handleConvert = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;

    const nextDue = frequency === "lease_monthly"
      ? format(addMonths(new Date(), 1), "yyyy-MM-dd")
      : format(addWeeks(new Date(), 1), "yyyy-MM-dd");

    // Create first lease payment record (pending)
    await createPayment.mutateAsync({
      loan_id: loan.id,
      payer_email: loan.borrower_email,
      payer_name: loan.borrower_name,
      payee_email: loan.lender_email,
      payee_name: loan.lender_name,
      item_name: loan.item_name,
      amount: parseFloat(amount),
      payment_type: frequency,
      payment_method: method,
      status: "pending",
      note,
      due_date: nextDue,
    });

    // Tag the loan as lease (store in notes or a lease flag via notes)
    await updateLoan.mutateAsync({
      notes: (loan.notes ? loan.notes + "\n" : "") + `[LEASE] $${parseFloat(amount).toFixed(2)}/${frequency === "lease_monthly" ? "mo" : "wk"} via ${method}`,
    });

    onClose();
  };

  return (
    <Card className="p-5 border-primary/30 space-y-4">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Convert to Lease</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Turn this loan into a recurring payment arrangement. The borrower will owe a regular fee to keep the item.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 rounded-xl bg-muted/50 border-0 text-sm pl-8"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-0 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lease_monthly">Monthly</SelectItem>
              <SelectItem value="lease_weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-0 text-sm">
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

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note (optional)</Label>
        <Input
          placeholder="Any terms or conditions..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-11 rounded-xl bg-muted/50 border-0 text-sm"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 rounded-xl h-11 text-sm" onClick={onClose}>Cancel</Button>
        <Button
          className="flex-1 rounded-xl h-11 text-sm bg-primary gap-2"
          onClick={handleConvert}
          disabled={!amount || createPayment.isPending || updateLoan.isPending}
        >
          <CheckCircle className="w-4 h-4" />
          Convert to Lease
        </Button>
      </div>
    </Card>
  );
}