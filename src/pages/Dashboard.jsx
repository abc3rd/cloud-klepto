import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import PullToRefresh from "../components/common/PullToRefresh";
import PushNotificationSetup from "../components/common/PushNotificationSetup";
import BulkReturnBar from "../components/dashboard/BulkReturnBar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Bell, Send, Inbox, ScanLine, Cloud } from "lucide-react";
import LoanCard from "../components/loans/LoanCard";
import EmptyState from "../components/loans/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SummaryChart from "../components/dashboard/SummaryChart";
import QuickStats from "../components/dashboard/QuickStats";
import LoanCalendar from "../components/dashboard/LoanCalendar";
import TopItemsLeaderboard from "../components/dashboard/TopItemsLeaderboard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("activity");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["loans"] });
  }, [queryClient]);

  const bulkReturnMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(
        ids.map((id) =>
          base44.entities.LoanItem.update(id, {
            status: "returned",
            return_date: new Date().toISOString().split("T")[0],
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      setSelected(new Set());
      setSelectMode(false);
    },
  });

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => base44.entities.LoanItem.list("-created_date", 100),
  });

  const myLoans = loans.filter(
    (l) => l.lender_email === user?.email || l.borrower_email === user?.email
  );

  const activeLoans = myLoans.filter((l) => ["active", "overdue", "requested_back", "return_pending"].includes(l.status));
  const lentOut = myLoans.filter((l) => l.lender_email === user?.email && l.status === "active");
  const borrowed = myLoans.filter((l) => l.borrower_email === user?.email && l.status === "active");
  const alerts = myLoans.filter((l) => ["overdue", "requested_back"].includes(l.status));

  const filteredLoans = tab === "activity"
    ? myLoans.slice(0, 20)
    : tab === "lent"
    ? myLoans.filter((l) => l.lender_email === user?.email)
    : myLoans.filter((l) => l.borrower_email === user?.email);

  // Recent contacts from loans
  const recentContacts = [...new Map(
    myLoans.flatMap((l) => [
      { name: l.lender_name, email: l.lender_email },
      { name: l.borrower_name, email: l.borrower_email },
    ])
      .filter((c) => c.email !== user?.email)
      .map((c) => [c.email, c])
  ).values()].slice(0, 5);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="pb-4">
      {/* Hero Card — Cash App style */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-[#b800b8] px-5 pt-14 pb-8 overflow-hidden">
        {/* bg decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-black/10 translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex items-start justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-6 h-6 text-white/80" />
            <span className="text-white font-bold text-lg tracking-tight">Cloud Klepto</span>
          </div>
          <div className="relative">
            <Link to="/">
              <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/10 relative">
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-white text-primary text-[10px] font-bold rounded-full border-0">
                    {alerts.length}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Balance-style display */}
        <div className="relative mb-8">
          <p className="text-white/60 text-sm mb-1">Items Out</p>
          <div className="flex items-end gap-3">
            <span className="text-white text-5xl font-black">{activeLoans.length}</span>
            <span className="text-white/70 text-lg mb-1.5">active loans</span>
          </div>
          <div className="flex gap-5 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white/60" />
              <span className="text-white/70 text-xs">{lentOut.length} lent out</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <span className="text-white/70 text-xs">{borrowed.length} borrowed</span>
            </div>
            {alerts.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-300" />
                <span className="text-yellow-200 text-xs font-medium">{alerts.length} need action</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons — Cash App style */}
        <div className="relative flex gap-3">
          <Link to="/create" className="flex-1">
            <Button className="w-full h-12 rounded-2xl bg-white text-primary font-bold hover:bg-white/90 gap-2 shadow-lg">
              <Send className="w-4 h-4" />
              Lend
            </Button>
          </Link>
          <Link to="/create" className="flex-1">
            <Button className="w-full h-12 rounded-2xl bg-white/15 text-white font-bold hover:bg-white/25 border border-white/20 gap-2 backdrop-blur-sm">
              <Inbox className="w-4 h-4" />
              Borrow
            </Button>
          </Link>
          <Link to="/scan">
            <Button size="icon" className="h-12 w-12 rounded-2xl bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-sm">
              <ScanLine className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <PushNotificationSetup />

      <div className="px-5 mt-6">
        {/* Quick Stats */}
        <QuickStats loans={loans} userEmail={user?.email} />

        {/* Summary Chart */}
        <div className="mb-5">
          <SummaryChart
            active={activeLoans.length}
            returned={myLoans.filter((l) => l.status === "returned").length}
            total={myLoans.length}
          />
        </div>

        {/* Loan Calendar */}
        <div className="mb-5">
          <LoanCalendar loans={myLoans} />
        </div>

        {/* Top 10 Leaderboard */}
        <TopItemsLeaderboard loans={loans} />

        {/* Recent People */}
        {recentContacts.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent</p>
            <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1">
              {recentContacts.map((c) => (
                <Link key={c.email} to="/create" className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <span className="text-primary font-bold text-base">
                      {c.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate max-w-[52px]">
                    {c.name?.split(" ")[0]}
                  </span>
                </Link>
              ))}
              <Link to="/create" className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <span className="text-muted-foreground font-bold text-lg">+</span>
                </div>
                <span className="text-[11px] text-muted-foreground">New</span>
              </Link>
            </div>
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-5 space-y-2">
            {alerts.map((loan) => (
              <Link key={loan.id} to={`/loan/${loan.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                      {loan.status === "overdue" ? "Overdue" : "Return Requested"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{loan.item_name}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bulk select toggle */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loans</p>
          <button
            onClick={() => { setSelectMode((v) => !v); setSelected(new Set()); }}
            className="text-xs text-primary font-semibold"
          >
            {selectMode ? "Cancel" : "Select"}
          </button>
        </div>

        {/* Activity Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-4">
          <TabsList className="w-full bg-muted/60 rounded-full p-1 h-auto">
            <TabsTrigger value="activity" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">Activity</TabsTrigger>
            <TabsTrigger value="lent" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <ArrowUpRight className="w-3 h-3 mr-1" />Lent
            </TabsTrigger>
            <TabsTrigger value="borrowed" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <ArrowDownLeft className="w-3 h-3 mr-1" />Borrowed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : filteredLoans.length === 0 ? (
          <EmptyState
            title="No loans yet"
            description="Tap Lend to log your first item, or Borrow to record something you've taken."
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredLoans.map((loan, i) => {
                const isSelectable = selectMode && ["active", "requested_back", "return_pending"].includes(loan.status);
                const isSelected = selected.has(loan.id);
                return (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="relative"
                    onClick={isSelectable ? () => toggleSelect(loan.id) : undefined}
                  >
                    {selectMode && (
                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? "bg-primary border-primary" : "bg-background border-muted-foreground"
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    )}
                    <div className={selectMode ? "pl-10 pointer-events-none" : ""}>
                      <LoanCard loan={loan} currentUserEmail={user?.email} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
    <BulkReturnBar
      selectedCount={selected.size}
      onReturn={() => bulkReturnMutation.mutate([...selected])}
      onClear={() => { setSelected(new Set()); setSelectMode(false); }}
      isPending={bulkReturnMutation.isPending}
    />
    </PullToRefresh>
  );
}