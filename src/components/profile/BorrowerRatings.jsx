import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="p-0.5"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              s <= (hover || value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingDisplay({ stars }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= stars ? "fill-yellow-400 text-yellow-400" : "text-muted/50"}`}
        />
      ))}
    </div>
  );
}

export default function BorrowerRatings({ currentUser, returnedLoans }) {
  const queryClient = useQueryClient();
  const [activeRating, setActiveRating] = useState(null); // loan being rated
  const [stars, setStars] = useState(5);
  const [conditionFeedback, setConditionFeedback] = useState("good");
  const [reliability, setReliability] = useState("on_time");
  const [comment, setComment] = useState("");

  const { data: ratings = [] } = useQuery({
    queryKey: ["ratings"],
    queryFn: () => base44.entities.BorrowerRating.list("-created_date", 100),
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.BorrowerRating.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings"] });
      setActiveRating(null);
      setStars(5);
      setConditionFeedback("good");
      setReliability("on_time");
      setComment("");
    },
  });

  // Loans where current user is lender and item was returned — eligible for rating
  const ratableLoans = returnedLoans.filter(
    (l) => l.lender_email === currentUser?.email && l.status === "returned"
  );

  // Already-rated loan IDs
  const ratedLoanIds = new Set(
    ratings.filter((r) => r.lender_email === currentUser?.email).map((r) => r.loan_id)
  );

  // Ratings received by current user (as borrower)
  const myReceivedRatings = ratings.filter((r) => r.borrower_email === currentUser?.email);
  const avgStars = myReceivedRatings.length
    ? (myReceivedRatings.reduce((a, r) => a + r.stars, 0) / myReceivedRatings.length).toFixed(1)
    : null;

  const handleSubmit = (loan) => {
    submitMutation.mutate({
      loan_id: loan.id,
      lender_email: currentUser.email,
      lender_name: currentUser.full_name,
      borrower_email: loan.borrower_email,
      borrower_name: loan.borrower_name,
      item_name: loan.item_name,
      stars,
      condition_feedback: conditionFeedback,
      reliability,
      comment,
    });
  };

  return (
    <div className="space-y-4">
      {/* My rating summary */}
      {myReceivedRatings.length > 0 && (
        <Card className="p-4 border-border/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">My Borrower Rating</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black">{avgStars}</span>
            <div>
              <RatingDisplay stars={Math.round(avgStars)} />
              <p className="text-xs text-muted-foreground mt-1">{myReceivedRatings.length} review{myReceivedRatings.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {myReceivedRatings.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-start gap-2 py-2 border-t border-border/40">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{r.lender_name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{r.lender_name}</span>
                    <RatingDisplay stars={r.stars} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{r.item_name}</p>
                  {r.comment && <p className="text-xs mt-0.5 text-foreground/80">{r.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pending ratings to give */}
      {ratableLoans.filter((l) => !ratedLoanIds.has(l.id)).length > 0 && (
        <Card className="p-4 border-border/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Rate Borrowers</p>
          <div className="space-y-3">
            {ratableLoans
              .filter((l) => !ratedLoanIds.has(l.id))
              .map((loan) => (
                <div key={loan.id}>
                  {activeRating === loan.id ? (
                    <div className="space-y-3 p-3 rounded-2xl bg-accent/30">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{loan.borrower_name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{loan.borrower_name}</p>
                          <p className="text-xs text-muted-foreground">{loan.item_name}</p>
                        </div>
                      </div>
                      <StarPicker value={stars} onChange={setStars} />
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={conditionFeedback} onValueChange={setConditionFeedback}>
                          <SelectTrigger className="h-10 rounded-xl bg-background border-border text-xs">
                            <SelectValue placeholder="Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent condition</SelectItem>
                            <SelectItem value="good">Good condition</SelectItem>
                            <SelectItem value="fair">Fair condition</SelectItem>
                            <SelectItem value="poor">Poor condition</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={reliability} onValueChange={setReliability}>
                          <SelectTrigger className="h-10 rounded-xl bg-background border-border text-xs">
                            <SelectValue placeholder="Reliability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="on_time">Returned on time</SelectItem>
                            <SelectItem value="slightly_late">Slightly late</SelectItem>
                            <SelectItem value="very_late">Very late</SelectItem>
                            <SelectItem value="no_return">Did not return</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        placeholder="Optional comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="rounded-xl bg-background border-border text-xs min-h-[64px]"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-xl h-9 text-xs" onClick={() => setActiveRating(null)}>Cancel</Button>
                        <Button
                          className="flex-1 rounded-xl h-9 text-xs bg-primary"
                          onClick={() => handleSubmit(loan)}
                          disabled={submitMutation.isPending}
                        >
                          Submit Rating
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{loan.borrower_name?.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{loan.borrower_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{loan.item_name}</p>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-xl h-8 text-xs bg-primary/10 text-primary hover:bg-primary/20"
                        variant="ghost"
                        onClick={() => setActiveRating(loan.id)}
                      >
                        <Star className="w-3 h-3 mr-1" /> Rate
                      </Button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}