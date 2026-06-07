import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import LoanCard from "../components/loans/LoanCard";
import EmptyState from "../components/loans/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Activity() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: () => base44.entities.LoanItem.list("-created_date", 200),
  });

  const myLoans = loans.filter(
    (l) => l.lender_email === user?.email || l.borrower_email === user?.email
  );

  const filteredLoans = myLoans
    .filter((l) => {
      if (tab === "completed") return l.status === "returned";
      if (tab === "issues") return ["lost", "stolen"].includes(l.status);
      return true;
    })
    .filter((l) =>
      !search ||
      l.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.borrower_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.lender_name?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="text-lg font-bold mb-5">Activity</h1>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search items, people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 rounded-2xl bg-muted/60 border-0 text-sm"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList className="w-full bg-muted/60 rounded-full p-1 h-auto">
          <TabsTrigger value="all" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">All</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">Returned</TabsTrigger>
          <TabsTrigger value="issues" className="rounded-full text-xs flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">Issues</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : filteredLoans.length === 0 ? (
        <EmptyState title="No activity yet" description="Your completed and resolved loans will appear here." />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredLoans.map((loan, i) => (
              <motion.div key={loan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <LoanCard loan={loan} currentUserEmail={user?.email} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}