import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const medalColors = ["text-yellow-400", "text-slate-400", "text-amber-600"];

export default function TopItemsLeaderboard({ loans }) {
  const topItems = useMemo(() => {
    const map = {};
    for (const loan of loans) {
      const key = loan.item_name?.toLowerCase().trim();
      if (!key) continue;
      if (!map[key]) {
        map[key] = { name: loan.item_name, total: 0, clean: 0, issues: 0 };
      }
      map[key].total++;
      if (loan.status === "returned") map[key].clean++;
      if (["lost", "stolen"].includes(loan.status)) map[key].issues++;
    }

    return Object.values(map)
      .filter((i) => i.total >= 1)
      .sort((a, b) => {
        // Primary: total loans (demand). Secondary: clean return rate.
        const rateA = a.total > 0 ? a.clean / a.total : 0;
        const rateB = b.total > 0 ? b.clean / b.total : 0;
        if (b.total !== a.total) return b.total - a.total;
        return rateB - rateA;
      })
      .slice(0, 10);
  }, [loans]);

  if (topItems.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top 10 Most Loaned Items</p>
      </div>
      <Card className="border-border/50 overflow-hidden">
        {topItems.map((item, i) => {
          const rate = item.total > 0 ? Math.round((item.clean / item.total) * 100) : 0;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 px-4 py-3 ${i < topItems.length - 1 ? "border-b border-border/40" : ""}`}
            >
              {/* Rank */}
              <div className="w-6 text-center">
                {i < 3 ? (
                  <Trophy className={`w-4 h-4 ${medalColors[i]}`} />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                )}
              </div>

              {/* Item info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.total} loan{item.total !== 1 ? "s" : ""}</span>
                  {item.issues > 0 && (
                    <span className="text-xs text-destructive">· {item.issues} issue{item.issues !== 1 ? "s" : ""}</span>
                  )}
                </div>
              </div>

              {/* Clean return rate */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <Star className={`w-3 h-3 ${rate >= 90 ? "text-yellow-400 fill-yellow-400" : rate >= 70 ? "text-emerald-500" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-bold ${rate >= 90 ? "text-yellow-500" : rate >= 70 ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {rate}%
                  </span>
                </div>
                {/* Mini bar */}
                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${rate >= 90 ? "bg-yellow-400" : rate >= 70 ? "bg-emerald-500" : "bg-destructive"}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </Card>
    </div>
  );
}