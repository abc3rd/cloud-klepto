import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";

export default function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mb-6">
        <Package className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">{description}</p>
      <Link to="/create">
        <Button className="rounded-full px-6 gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Create First Loan
        </Button>
      </Link>
    </div>
  );
}