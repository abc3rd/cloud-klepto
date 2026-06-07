import { Card } from "@/components/ui/card";
import { RadialBarChart, RadialBar, ResponsiveContainer, Cell } from "recharts";

export default function SummaryChart({ active, returned, total }) {
  const pct = total === 0 ? 0 : Math.round((returned / total) * 100);

  return (
    <Card className="p-4 border-border/50">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Loan Overview</p>
      <div className="flex items-center gap-4">
        {/* Donut progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="65%" outerRadius="100%"
              startAngle={90} endAngle={-270}
              barSize={8}
              data={[{ value: pct }]}
            >
              <RadialBar
                background={{ fill: "hsl(var(--muted))" }}
                dataKey="value"
                cornerRadius={8}
              >
                <Cell fill="hsl(var(--primary))" />
              </RadialBar>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black">{pct}%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <span className="text-sm font-bold">{active}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Returned</span>
            </div>
            <span className="text-sm font-bold">{returned}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <span className="text-sm font-bold">{total}</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}