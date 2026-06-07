import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Simple QR code generator using a public API (no library needed)
export default function UserQRCode({ user }) {
  const qrData = encodeURIComponent(
    JSON.stringify({ id: user?.id, name: user?.full_name, email: user?.email })
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=ea00ea&bgcolor=ffffff&data=${qrData}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = "cloud-klepto-qr.png";
    link.target = "_blank";
    link.click();
  };

  return (
    <Card className="border-border/50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 text-center">
        My Cloud Klepto QR Code
      </p>
      <div className="flex flex-col items-center gap-4">
        <div className="p-3 rounded-2xl border-2 border-primary/20 bg-white">
          <img
            src={qrUrl}
            alt="Your QR Code"
            className="w-44 h-44 rounded-xl"
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">{user?.full_name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Scan to instantly create a loan agreement
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl gap-2 border-primary/30 text-primary"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
          Save QR Code
        </Button>
      </div>
    </Card>
  );
}