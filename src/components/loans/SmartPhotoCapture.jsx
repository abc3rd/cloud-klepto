import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Sparkles, Loader2, FolderOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SmartPhotoCapture({ onPhotoTaken, onNameSuggested, label = "Add Photo", showAiNaming = false }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setSuggestion(null);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onPhotoTaken(file_url);
    setUploading(false);

    if (showAiNaming) {
      setAnalyzing(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: "Look at this image and identify the main object/item. Respond with ONLY a short, clear item name (2-5 words max) suitable for a lending app. Examples: 'Power Drill', 'Canon DSLR Camera', 'Acoustic Guitar', 'Camping Tent'. No punctuation, no explanation.",
        file_urls: [file_url],
      });
      const name = typeof result === "string" ? result.trim() : null;
      if (name) {
        setSuggestion(name);
        if (onNameSuggested) onNameSuggested(name);
      }
      setAnalyzing(false);
    }
  };

  const clearPhoto = () => {
    setPreview(null);
    setSuggestion(null);
    onPhotoTaken(null);
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden">
          <img src={preview} alt="Captured" className="w-full h-44 object-cover rounded-2xl" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 w-8 h-8 rounded-full"
            onClick={clearPhoto}
          >
            <X className="w-4 h-4" />
          </Button>
          {(uploading || analyzing) && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-2xl gap-2">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <p className="text-white text-xs font-medium">
                {uploading ? "Uploading…" : "AI identifying item…"}
              </p>
            </div>
          )}
          {suggestion && !analyzing && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/70">AI suggested name:</p>
                <p className="text-white text-sm font-bold truncate">{suggestion}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => cameraRef.current?.click()}
            className="h-28 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/60 hover:bg-accent/50 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium">Camera</span>
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            className="h-28 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/60 hover:bg-accent/50 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium">Gallery / Cloud</span>
          </button>
        </div>
      )}

      {/* Camera input */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => processFile(e.target.files?.[0])}
      />
      {/* Gallery / cloud (no capture attr = lets user pick from gallery, iCloud, Google Photos, etc.) */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => processFile(e.target.files?.[0])}
      />

      {showAiNaming && !preview && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          AI will auto-name the item from your photo
        </p>
      )}
    </div>
  );
}