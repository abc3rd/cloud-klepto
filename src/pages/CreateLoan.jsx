import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";
import PhotoCapture from "../components/loans/PhotoCapture";
import { format } from "date-fns";

export default function CreateLoan() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const [form, setForm] = useState({
    item_name: "",
    item_description: "",
    item_photo: "",
    borrower_name: "",
    borrower_email: "",
    due_date: "",
    condition_at_loan: "good",
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LoanItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      navigate("/");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      lender_email: user?.email,
      lender_name: user?.full_name || "Me",
      loan_date: format(new Date(), "yyyy-MM-dd"),
      status: "active",
    });
  };

  const updateField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">New Loan</h1>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <PhotoCapture
          onPhotoTaken={(url) => updateField("item_photo", url)}
          label="Photo of Item"
        />

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item Name</Label>
          <Input
            placeholder="e.g., MacBook Pro, Power Drill..."
            value={form.item_name}
            onChange={(e) => updateField("item_name", e.target.value)}
            className="h-12 rounded-xl bg-muted/50 border-0 text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
          <Textarea
            placeholder="Any details about the item..."
            value={form.item_description}
            onChange={(e) => updateField("item_description", e.target.value)}
            className="rounded-xl bg-muted/50 border-0 text-sm min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Borrower Name</Label>
            <Input
              placeholder="Name"
              value={form.borrower_name}
              onChange={(e) => updateField("borrower_name", e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-0 text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Borrower Email</Label>
            <Input
              type="email"
              placeholder="Email"
              value={form.borrower_email}
              onChange={(e) => updateField("borrower_email", e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-0 text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Return By</Label>
            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => updateField("due_date", e.target.value)}
              className="h-12 rounded-xl bg-muted/50 border-0 text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Condition</Label>
            <Select value={form.condition_at_loan} onValueChange={(v) => updateField("condition_at_loan", v)}>
              <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like_new">Like New</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</Label>
          <Textarea
            placeholder="Any loan terms or agreements..."
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="rounded-xl bg-muted/50 border-0 text-sm min-h-[80px]"
          />
        </div>

        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2"
        >
          {createMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Create Loan Agreement
            </>
          )}
        </Button>
      </motion.form>
    </div>
  );
}