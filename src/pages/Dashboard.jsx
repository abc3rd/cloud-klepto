import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ArrowUpRight, ArrowDownLeft, Cloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoanCard from "../components/loans/LoanCard";
import EmptyState from "../components/loans/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => base44.entities.LoanItem.list("-created_date", 100),
  });

  const myLoans = loans.filter(
    (l) => l.lender_email === user?.email || l.borrower_email === user?.email
  );

  const filteredLoans = myLoans.filter((l) => {
    if (tab === "lent") return l.lender_email === user?.email;
    if (tab === "borrowed") return l.borrower_email === user?.email;
    if (tab === "active") return ["active", "overdue", "requested_back"].includes(l.status);
    return true;
  });

  const activeCount = myLoans.filter((l) =>
    ["active", "overdue", "requested_back"].includes(l.status)
  ).length;

  const lentCount = myLoans.filter((l) => l.lender_email === user?.email && l.status === "active").length;
  const borrowedCount = myLoans.filter((l) => l.borrower_email === user?.email && l.status === "active").length;

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <Cloud className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Cloud Klepto</h1>
            <p className="text-xs text-muted-foreground">
              {user?.full_name ? `Hey, ${user.full_name.split(" ")[0]}` : "Item Tracker"}
            </p>
          </div>
        </div>
        <Link to="/create">
          <Button size="icon" className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 border border-border/50"
        >
          <p className="text-2xl font-bold text-primary">{activeCount}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Active</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-4 border border-border/50"
        >
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-primary" />
            <p className="text-2xl font-bold">{lentCount}</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Lent Out</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 border border-border/50"
        >
          <div className="flex items-center gap-1.5">
            <ArrowDownLeft className="w-4 h-4 text-secondary" />
            <p className="text-2xl font-bold">{borrowedCount}</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Borrowed</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList className="w-full bg-muted/60 rounded-full p-1 h-auto">
          <TabsTrigger value="all" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">All</TabsTrigger>
          <TabsTrigger value="active" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">Active</TabsTrigger>
          <TabsTrigger value="lent" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">Lent</TabsTrigger>
          <TabsTrigger value="borrowed" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">Borrowed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loans List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : filteredLoans.length === 0 ? (
        <EmptyState
          title="No loans yet"
          description="Start tracking your items by creating your first loan or borrowing record."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredLoans.map((loan, i) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <LoanCard loan={loan} currentUserEmail={user?.email} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}