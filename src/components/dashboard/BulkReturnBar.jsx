import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BulkReturnBar({ selectedCount, onReturn, onClear, isPending }) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 0.97, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className="fixed bottom-20 left-0 right-0 z-40 flex justify-center px-5"
        >
          <div className="flex items-center gap-3 bg-foreground text-background rounded-2xl px-4 py-3 shadow-2xl w-full max-w-sm">
            <button onClick={onClear} className="text-background/60 hover:text-background">
              <X className="w-4 h-4" />
            </button>
            <span className="flex-1 text-sm font-semibold">{selectedCount} item{selectedCount !== 1 ? "s" : ""} selected</span>
            <Button
              size="sm"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 h-9 text-xs font-bold"
              onClick={onReturn}
              disabled={isPending}
            >
              {isPending ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              Mark Returned
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}