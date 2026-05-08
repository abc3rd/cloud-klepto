import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Package, Calendar, User, Clock, Camera,
  RotateCcw, AlertTriangle, ShieldX, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { differenceInDays, parseISO, format } from "date-fns";
import StatusBadge from "../components/loans/StatusBadge";
import PhotoCapture from "../components/loans/PhotoCapture";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnPhoto, setReturnPhoto] = useState(null);
  const [returnCondition, setReturnCondition] = useState("good");

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: loan, isLoading } = useQuery({
    queryKey: ["loan", id],
    queryFn: async () => {
      const items = await base44.entities.LoanItem.filter({ id });
      return items[0];
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ data }) => base44.entities.LoanItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan", id] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      setShowReturnForm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="px-5 pt-14 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="px-5 pt-14 text-center">
        <p className="text-muted-foreground">Loan not found</p>
      </div>
    );
  }

  const isLender = loan.lender_email === user?.email;
  const daysLoaned = differenceInDays(
    loan.return_date ? parseISO(loan.return_date) : new Date(),
    parseISO(loan.loan_date)
  );
  const daysUntilDue = differenceInDays(parseISO(loan.due_date), new Date());
  const isOverdue = daysUntilDue < 0 && loan.status === "active";

  const handleReturn = () => {
    updateMutation.mutate({
      data: {
        status: "return_pending",
        return_photo: returnPhoto,
        return_date: format(new Date(), "yyyy-MM-dd"),
        condition_at_return: returnCondition,
      },
    });
  };

  const handleConfirmReturn = () => {
    updateMutation.mutate({ data: { status: "returned" } });
  };

  const handleRequestBack = () => {
    updateMutation.mutate({ data: { status: "requested_back" } });
  };

  const handleMarkLost = () => {
    updateMutation.mutate({ data: { status: "lost" } });
  };

  const handleMarkStolen = () => {
    updateMutation.mutate({ data: { status: "stolen" } });
  };

  return (
    <div className="px-5 pt-14 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Loan Details</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Item Hero */}
        <Card className="overflow-hidden border-border/50">
          {loan.item_photo && (
            <img src={loan.item_photo} alt={loan.item_name} className="w-full h-48 object-cover" />
          )}
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{loan.item_name}</h2>
                {loan.item_description && (
                  <p className="text-sm text-muted-foreground mt-1">{loan.item_description}</p>
                )}
              </div>
              <StatusBadge status={isOverdue ? "overdue" : loan.status} />
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card className="p-5 space-y-4 border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lender</p>
              <p className="text-sm font-semibold">{loan.lender_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Borrower</p>
              <p className="text-sm font-semibold">{loan.borrower_name}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Loaned</p>
                <p className="text-sm font-medium">{format(parseISO(loan.loan_date), "MMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Due</p>
                <p className={`text-sm font-medium ${isOverdue ? "text-destructive" : ""}`}>
                  {format(parseISO(loan.due_date), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Days Loaned</p>
              <p className="text-sm font-medium">{daysLoaned} days</p>
            </div>
          </div>

          {loan.condition_at_loan && (
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Condition at Loan</p>
                <p className="text-sm font-medium capitalize">{loan.condition_at_loan.replace("_", " ")}</p>
              </div>
            </div>
          )}

          {loan.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{loan.notes}</p>
              </div>
            </>
          )}
        </Card>

        {/* Return Photo */}
        {loan.return_photo && (
          <Card className="overflow-hidden border-border/50">
            <div className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">Return Confirmation</p>
              </div>
            </div>
            <img src={loan.return_photo} alt="Return confirmation" className="w-full h-48 object-cover" />
            {loan.condition_at_return && (
              <div className="p-4 pt-2">
                <p className="text-xs text-muted-foreground">
                  Returned in <span className="font-medium capitalize">{loan.condition_at_return.replace("_", " ")}</span> condition
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Return Form */}
        {showReturnForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <Card className="p-5 space-y-4 border-primary/30">
              <h3 className="font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Return Confirmation
              </h3>
              <PhotoCapture onPhotoTaken={setReturnPhoto} label="Photo of returned item" />
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Return Condition</Label>
                <Select value={returnCondition} onValueChange={setReturnCondition}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowReturnForm(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-primary hover:bg-primary/90 gap-2"
                  onClick={handleReturn}
                  disabled={updateMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4" />
                  Submit Return
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        {loan.status === "active" && (
          <div className="space-y-3">
            {!isLender && !showReturnForm && (
              <Button
                className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2"
                onClick={() => setShowReturnForm(true)}
              >
                <RotateCcw className="w-4 h-4" />
                Return Item
              </Button>
            )}

            {isLender && (
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl font-semibold gap-2 border-primary/30 text-primary"
                onClick={handleRequestBack}
                disabled={updateMutation.isPending}
              >
                <AlertTriangle className="w-4 h-4" />
                Request Item Back
              </Button>
            )}

            {isLender && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl font-semibold gap-2 border-destructive/30 text-destructive"
                  onClick={handleMarkLost}
                  disabled={updateMutation.isPending}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Mark Lost
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl font-semibold gap-2 border-destructive/30 text-destructive"
                  onClick={handleMarkStolen}
                  disabled={updateMutation.isPending}
                >
                  <ShieldX className="w-4 h-4" />
                  Mark Stolen
                </Button>
              </div>
            )}
          </div>
        )}

        {loan.status === "requested_back" && !isLender && !showReturnForm && (
          <Card className="p-4 border-orange-500/30 bg-orange-500/5">
            <p className="text-sm font-medium text-orange-600 mb-3">
              The lender has requested this item back.
            </p>
            <Button
              className="w-full h-12 rounded-2xl font-semibold bg-primary hover:bg-primary/90 gap-2"
              onClick={() => setShowReturnForm(true)}
            >
              <RotateCcw className="w-4 h-4" />
              Return Item Now
            </Button>
          </Card>
        )}

        {loan.status === "return_pending" && isLender && (
          <Button
            className="w-full h-14 rounded-2xl text-base font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-lg gap-2"
            onClick={handleConfirmReturn}
            disabled={updateMutation.isPending}
          >
            <CheckCircle className="w-4 h-4" />
            Confirm Return Received
          </Button>
        )}
      </motion.div>
    </div>
  );
}