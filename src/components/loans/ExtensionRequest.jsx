import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CalendarClock, X, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

export default function ExtensionRequest({ loan, onClose }) {
  const [newDate, setNewDate] = useState(loan.due_date || "");
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSend = async () => {
    if (!newDate) return;
    setSending(true);

    await base44.integrations.Core.SendEmail({
      to: loan.lender_email,
      subject: `Extension Request: ${loan.item_name}`,
      body: `Hi ${loan.lender_name},\n\n${loan.borrower_name} has requested an extension on the return date for "${loan.item_name}".\n\nCurrent due date: ${loan.due_date}\nRequested new due date: ${newDate}\n${reason ? `\nReason: ${reason}` : ""}\n\nPlease log in to Cloud Klepto to approve or deny this request.\n\nThanks,\nCloud Klepto`,
    });

    setSending(false);
    setDone(true);
    setTimeout(onClose, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
      <Card className="p-5 border-primary/30 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary" />
            Request Extension
          </h3>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <Send className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium text-center">Extension request sent to {loan.lender_name}!</p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Requested New Return Date
              </Label>
              <Input
                type="date"
                value={newDate}
                min={loan.due_date}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-11 rounded-xl bg-muted/50 border-0 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reason (optional)
              </Label>
              <Textarea
                placeholder="Why do you need more time?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-xl bg-muted/50 border-0 text-sm min-h-[70px]"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 gap-2"
                onClick={handleSend}
                disabled={sending || !newDate}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Request
              </Button>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
}