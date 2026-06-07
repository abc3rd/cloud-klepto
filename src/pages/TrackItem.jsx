import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Wifi, Bluetooth, ExternalLink, Package } from "lucide-react";
import { motion } from "framer-motion";

const TRACKER_TYPES = [
  { value: "tile", label: "Tile", icon: "🔵", deeplink: "tile://" },
  { value: "airtag", label: "Apple AirTag", icon: "🏷️", deeplink: "https://www.icloud.com/find" },
  { value: "samsung_tag", label: "Samsung SmartTag", icon: "🟡", deeplink: "https://smartthings.com" },
  { value: "chipolo", label: "Chipolo", icon: "🔴", deeplink: "https://app.chipolo.net" },
  { value: "manual", label: "Manual Location", icon: "📍", deeplink: null },
];

export default function TrackItem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [trackerType, setTrackerType] = useState("");
  const [trackerUrl, setTrackerUrl] = useState("");
  const [manualLocation, setManualLocation] = useState("");

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: loans = [] } = useQuery({
    queryKey: ["loans"],
    queryFn: () => base44.entities.LoanItem.list("-created_date", 100),
  });

  const activeLoans = loans.filter(
    (l) => l.lender_email === user?.email && ["active", "overdue", "requested_back"].includes(l.status)
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LoanItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      setSelectedLoan(null);
    },
  });

  const handleAttachTracker = () => {
    if (!selectedLoan) return;
    updateMutation.mutate({
      id: selectedLoan.id,
      data: {
        tracker_type: trackerType,
        tracker_url: trackerType !== "manual" ? trackerUrl : null,
        tracker_location: trackerType === "manual" ? manualLocation : null,
      },
    });
  };

  const trackedLoans = activeLoans.filter((l) => l.tracker_type);

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Track Loaned Items</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Info banner */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 flex gap-3">
          <Bluetooth className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-primary">
            Link your Tile, AirTag, or other tracker to a loaned item. Open your tracker app directly from here to see where your item is.
          </p>
        </div>

        {/* Currently tracked */}
        {trackedLoans.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Currently Tracked</p>
            <div className="space-y-3">
              {trackedLoans.map((loan) => {
                const tracker = TRACKER_TYPES.find((t) => t.value === loan.tracker_type);
                return (
                  <Card key={loan.id} className="p-4 border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center text-lg">
                        {tracker?.icon || "📍"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{loan.item_name}</p>
                        <p className="text-xs text-muted-foreground">
                          with {loan.borrower_name} · via {tracker?.label}
                        </p>
                        {loan.tracker_location && (
                          <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{loan.tracker_location}
                          </p>
                        )}
                      </div>
                      {loan.tracker_url && (
                        <a href={loan.tracker_url} target="_blank" rel="noopener noreferrer">
                          <Button size="icon" variant="outline" className="rounded-xl h-9 w-9">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                      {tracker?.deeplink && !loan.tracker_url && (
                        <a href={tracker.deeplink} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="rounded-xl text-xs">
                            Open App
                          </Button>
                        </a>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Attach tracker */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Attach Tracker to Item</p>
          {activeLoans.length === 0 ? (
            <Card className="p-8 border-border/50 text-center">
              <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active loans to track</p>
            </Card>
          ) : (
            <Card className="p-5 border-border/50 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Item</Label>
                <Select onValueChange={(val) => setSelectedLoan(activeLoans.find((l) => l.id === val))}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0">
                    <SelectValue placeholder="Choose a loaned item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeLoans.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.item_name} → {l.borrower_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracker Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TRACKER_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTrackerType(t.value)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        trackerType === t.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      <div className="text-lg mb-1">{t.icon}</div>
                      <p className="text-[10px] font-medium">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {trackerType && trackerType !== "manual" && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tracker Sharing URL (optional)
                  </Label>
                  <Input
                    placeholder="Paste share link from your tracker app..."
                    value={trackerUrl}
                    onChange={(e) => setTrackerUrl(e.target.value)}
                    className="h-12 rounded-xl bg-muted/50 border-0 text-sm"
                  />
                </div>
              )}

              {trackerType === "manual" && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Known Location</Label>
                  <Input
                    placeholder="e.g., John's garage, 123 Main St..."
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="h-12 rounded-xl bg-muted/50 border-0 text-sm"
                  />
                </div>
              )}

              <Button
                className="w-full h-12 rounded-2xl font-semibold bg-primary hover:bg-primary/90 gap-2"
                onClick={handleAttachTracker}
                disabled={!selectedLoan || !trackerType || updateMutation.isPending}
              >
                <Wifi className="w-4 h-4" />
                Attach Tracker
              </Button>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}