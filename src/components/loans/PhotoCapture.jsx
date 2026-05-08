import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Image, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PhotoCapture({ onPhotoTaken, label = "Take Photo" }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onPhotoTaken(file_url);
    setUploading(false);
  };

  const clearPhoto = () => {
    setPreview(null);
    onPhotoTaken(null);
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden">
          <img src={preview} alt="Captured" className="w-full h-48 object-cover rounded-2xl" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 w-8 h-8 rounded-full"
            onClick={clearPhoto}
          >
            <X className="w-4 h-4" />
          </Button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full h-36 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/60 hover:bg-accent/50 transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}