import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths, isSameMonth, isToday } from "date-fns";
import { Link } from "react-router-dom";

export default function LoanCalendar({ loans }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to start on Sunday
  const startPad = monthStart.getDay();
  const paddedDays = [...Array(startPad).fill(null), ...days];

  const getEventsForDay = (day) => {
    if (!day) return [];
    const events = [];
    loans.forEach((loan) => {
      if (loan.loan_date && isSameDay(parseISO(loan.loan_date), day)) {
        events.push({ type: "start", loan });
      }
      if (loan.due_date && isSameDay(parseISO(loan.due_date), day)) {
        events.push({ type: "due", loan });
      }
    });
    return events;
  };

  const [selected, setSelected] = useState(null);
  const selectedEvents = selected ? getEventsForDay(selected) : [];

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Loan Calendar</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-medium w-20 text-center">{format(currentMonth, "MMM yyyy")}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 px-3 gap-y-1 pb-3">
        {paddedDays.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const events = getEventsForDay(day);
          const hasStart = events.some((e) => e.type === "start");
          const hasDue = events.some((e) => e.type === "due");
          const isSelected = selected && isSameDay(day, selected);
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelected(isSelected ? null : day)}
              className={`relative flex flex-col items-center py-1 rounded-xl transition-all ${
                isSelected ? "bg-primary text-white" : today ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
              }`}
            >
              <span className={`text-xs font-medium ${isSelected ? "text-white" : today ? "text-primary font-bold" : ""}`}>
                {format(day, "d")}
              </span>
              {(hasStart || hasDue) && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasStart && <div className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`} />}
                  {hasDue && <div className={`w-1 h-1 rounded-full ${isSelected ? "bg-yellow-200" : "bg-yellow-500"}`} />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 pb-3 border-t border-border/50 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] text-muted-foreground">Loan start</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-[10px] text-muted-foreground">Due date</span>
        </div>
      </div>

      {/* Selected day events */}
      {selected && selectedEvents.length > 0 && (
        <div className="border-t border-border/50 divide-y divide-border/40">
          {selectedEvents.map((e, i) => (
            <Link key={i} to={`/loan/${e.loan.id}`}>
              <div className="px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30 active:bg-muted/50 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.type === "due" ? "bg-yellow-500" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{e.loan.item_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {e.type === "due" ? "Due back" : "Loan starts"} · {e.loan.borrower_name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {selected && selectedEvents.length === 0 && (
        <div className="border-t border-border/50 px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">No loans on {format(selected, "MMM d")}</p>
        </div>
      )}
    </Card>
  );
}