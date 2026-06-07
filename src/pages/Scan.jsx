import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ScanLine, QrCode } from "lucide-react";
import { motion } from "framer-motion";

export default function Scan() {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-14 pb-4 min-h-screen bg-background">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Scan to Lend</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-8"
      >
        {/* Fake QR scanner frame */}
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 rounded-3xl border-2 border-primary/30 bg-muted/30" />
          {/* Corner decorations */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-3 border-l-3 border-primary rounded-tl-xl border-t-[3px] border-l-[3px]" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-3 border-r-3 border-primary rounded-tr-xl border-t-[3px] border-r-[3px]" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-3 border-l-3 border-primary rounded-bl-xl border-b-[3px] border-l-[3px]" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-3 border-r-3 border-primary rounded-br-xl border-b-[3px] border-r-[3px]" />
          {/* Scan line animation */}
          <motion.div
            className="absolute left-4 right-4 h-0.5 bg-primary/70 rounded-full shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]"
            animate={{ top: ["20%", "80%", "20%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <ScanLine className="w-10 h-10 text-primary/20" />
          </div>
        </div>

        <div className="text-center">
          <p className="font-semibold mb-1">Scan a user's QR code</p>
          <p className="text-sm text-muted-foreground">Point your camera at someone's Cloud Klepto QR to quickly start a loan</p>
        </div>

        <div className="w-full space-y-3">
          <Button
            className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2"
            onClick={() => navigate("/create")}
          >
            <QrCode className="w-4 h-4" />
            My QR Code
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl font-semibold gap-2"
            onClick={() => navigate("/create")}
          >
            Enter Email Instead
          </Button>
        </div>
      </motion.div>
    </div>
  );
}