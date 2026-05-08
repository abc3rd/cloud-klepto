import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, ArrowUpRight, ArrowDownLeft, CheckCircle, AlertTriangle, LogOut, Cloud } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: loans = [] } = useQuery({
    queryKey: ["loans"],
    queryFn: () => base44.entities.LoanItem.list("-created_date", 200),
  });

  const myLoans = loans.filter(
    (l) => l.lender_email === user?.email || l.borrower_email === user?.email
  );

  const stats = {
    totalLent: myLoans.filter((l) => l.lender_email === user?.email).length,
    totalBorrowed: myLoans.filter((l) => l.borrower_email === user?.email).length,
    returned: myLoans.filter((l) => l.status === "returned").length,
    issues: myLoans.filter((l) => ["lost", "stolen"].includes(l.status)).length,
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="text-lg font-bold mb-8">Profile</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* User Card */}
        <Card className="p-6 border-border/50 text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Cloud className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">{user?.full_name || "User"}</h2>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
            <Mail className="w-3.5 h-3.5" />
            {user?.email}
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Items Lent</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalLent}</p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft className="w-4 h-4 text-secondary" />
              <span className="text-xs text-muted-foreground">Items Borrowed</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalBorrowed}</p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Returned</span>
            </div>
            <p className="text-2xl font-bold">{stats.returned}</p>
          </Card>
          <Card className="p-4 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Issues</span>
            </div>
            <p className="text-2xl font-bold">{stats.issues}</p>
          </Card>
        </div>

        <Separator />

        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl font-semibold gap-2 text-destructive border-destructive/30"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
}