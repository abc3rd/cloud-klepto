import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, Inbox, Clock, CheckCircle, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";

export default function RequestItem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("request");
  const [form, setForm] = useState({
    lender_name: "", lender_email: "",
    item_name: "", item_description: "",
    requested_from_date: "", requested_to_date: "",
    message: "",
  });

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: allRequests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: () => base44.entities.ItemRequest.list("-created_date", 100),
  });

  const myRequests = allRequests.filter(
    (r) => r.requester_email === user?.email || r.lender_email === user?.email
  );
  const incoming = myRequests.filter((r) => r.lender_email === user?.email && r.status === "pending");
  const outgoing = myRequests.filter((r) => r.requester_email === user?.email);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ItemRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setTab("outgoing");
      setForm({ lender_name: "", lender_email: "", item_name: "", item_description: "", requested_from_date: "", requested_to_date: "", message: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ItemRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      requester_name: user?.full_name || "Me",
      requester_email: user?.email,
      status: "pending",
    });
  };

  const updateField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const statusColor = {
    pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    declined: "bg-destructive/15 text-destructive border-destructive/30",
    cancelled: "bg-muted text-muted-foreground",
  };

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Request to Borrow</h1>
        {incoming.length > 0 && (
          <Badge className="ml-auto bg-primary text-white rounded-full">{incoming.length}</Badge>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList className="w-full bg-muted/60 rounded-full p-1 h-auto">
          <TabsTrigger value="request" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Plus className="w-3 h-3 mr-1" />New
          </TabsTrigger>
          <TabsTrigger value="incoming" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Inbox className="w-3 h-3 mr-1" />Incoming {incoming.length > 0 && `(${incoming.length})`}
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Send className="w-3 h-3 mr-1" />Sent
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        {tab === "request" && (
          <motion.form key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            onSubmit={handleSubmit} className="space-y-5">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15">
              <p className="text-xs text-primary font-medium">
                💡 Request to borrow a specific item from someone. They'll get notified and can approve or decline.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lender Name</Label>
                <Input placeholder="Friend's name" value={form.lender_name} onChange={(e) => updateField("lender_name", e.target.value)}
                  className="h-12 rounded-xl bg-muted/50 border-0 text-sm" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lender Email</Label>
                <Input type="email" placeholder="their@email.com" value={form.lender_email} onChange={(e) => updateField("lender_email", e.target.value)}
                  className="h-12 rounded-xl bg-muted/50 border-0 text-sm" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Item I Want to Borrow</Label>
              <Input placeholder="e.g., Hammer, Ladder, Camera..." value={form.item_name} onChange={(e) => updateField("item_name", e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-0 text-sm" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From Date</Label>
                <Input type="date" value={form.requested_from_date} onChange={(e) => updateField("requested_from_date", e.target.value)}
                  className="h-12 rounded-xl bg-muted/50 border-0 text-sm" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To Date</Label>
                <Input type="date" value={form.requested_to_date} onChange={(e) => updateField("requested_to_date", e.target.value)}
                  className="h-12 rounded-xl bg-muted/50 border-0 text-sm" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message (optional)</Label>
              <Textarea placeholder="Why you need it, how you'll use it..." value={form.message} onChange={(e) => updateField("message", e.target.value)}
                className="rounded-xl bg-muted/50 border-0 text-sm min-h-[80px]" />
            </div>

            <Button type="submit" disabled={createMutation.isPending}
              className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2">
              {createMutation.isPending
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Send className="w-4 h-4" />Send Request</>}
            </Button>
          </motion.form>
        )}

        {tab === "incoming" && (
          <motion.div key="incoming" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {incoming.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No incoming requests</div>
            ) : incoming.map((r) => (
              <Card key={r.id} className="p-4 border-border/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{r.requester_name} wants to borrow</p>
                    <p className="text-primary font-bold">{r.item_name}</p>
                  </div>
                  <Badge variant="outline" className={statusColor[r.status]}>{r.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(r.requested_from_date), "MMM d")} – {format(parseISO(r.requested_to_date), "MMM d, yyyy")}
                </p>
                {r.message && <p className="text-xs bg-muted/50 rounded-xl p-3">"{r.message}"</p>}
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-1"
                      onClick={() => updateMutation.mutate({ id: r.id, status: "approved" })}>
                      <CheckCircle className="w-3.5 h-3.5" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 rounded-xl text-destructive border-destructive/30 gap-1"
                      onClick={() => updateMutation.mutate({ id: r.id, status: "declined" })}>
                      <X className="w-3.5 h-3.5" />Decline
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </motion.div>
        )}

        {tab === "outgoing" && (
          <motion.div key="outgoing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {outgoing.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No sent requests yet</div>
            ) : outgoing.map((r) => (
              <Card key={r.id} className="p-4 border-border/50 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Requested from {r.lender_name}</p>
                    <p className="font-bold text-sm">{r.item_name}</p>
                  </div>
                  <Badge variant="outline" className={statusColor[r.status]}>{r.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  <Clock className="inline w-3 h-3 mr-1" />
                  {format(parseISO(r.requested_from_date), "MMM d")} – {format(parseISO(r.requested_to_date), "MMM d, yyyy")}
                </p>
                {r.status === "pending" && (
                  <Button size="sm" variant="outline" className="text-xs rounded-xl text-destructive border-destructive/30"
                    onClick={() => updateMutation.mutate({ id: r.id, status: "cancelled" })}>
                    Cancel Request
                  </Button>
                )}
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}