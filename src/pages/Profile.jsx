import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  User, Mail, ArrowUpRight, ArrowDownLeft, CheckCircle,
  AlertTriangle, LogOut, Cloud, QrCode, Shield, Bell, ChevronRight
} from "lucide-react";
import UserQRCode from "../components/profile/UserQRCode";
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

  // Derive a simple "trust score" based on returns vs issues
  const totalCompleted = stats.returned + stats.issues;
  const trustScore = totalCompleted === 0 ? 100 : Math.round((stats.returned / totalCompleted) * 100);

  return (
    <div className="pb-4">
      {/* Header gradient like Cash App */}
      <div className="bg-gradient-to-br from-primary to-[#b800b8] px-5 pt-14 pb-10 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <span className="text-3xl font-black">{user?.full_name?.charAt(0) || "?"}</span>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">{user?.full_name || "User"}</h2>
            <p className="text-white/70 text-sm flex items-center justify-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-1.5 mt-1 bg-white/15 rounded-full px-3 py-1">
            <Shield className="w-3 h-3" />
            <span className="text-xs font-semibold">{trustScore}% Trust Score</span>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4">
        {/* Stats grid */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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
                <ArrowDownLeft className="w-4 h-4 text-secondary-foreground" />
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

          <UserQRCode user={user} />

          {/* Quick actions — PayPal-style menu */}
          <Card className="border-border/50 overflow-hidden divide-y divide-border/50">
            <Link to="/track">
              <div className="flex items-center gap-3 p-4 hover:bg-muted/30 active:bg-muted/50 transition-colors">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Track Items</p>
                  <p className="text-xs text-muted-foreground">Tile, AirTag & more</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-xs text-muted-foreground">Loan reminders & alerts</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">On</Badge>
            </div>
            <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Privacy & Security</p>
                <p className="text-xs text-muted-foreground">Manage your data</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>

          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl font-semibold gap-2 text-destructive border-destructive/30"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}