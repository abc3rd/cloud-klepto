import { useState, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) { setPulling(false); setPullY(0); return; }
    const el = containerRef.current;
    if (el && el.scrollTop > 0) return;
    setPulling(true);
    setPullY(Math.min(dy * 0.5, THRESHOLD + 20));
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(40);
      await onRefresh();
      setRefreshing(false);
    }
    startY.current = null;
    setPulling(false);
    setPullY(0);
  }, [pullY, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto h-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-20 overflow-hidden transition-all"
        style={{ height: pullY > 0 ? pullY : refreshing ? 40 : 0 }}
      >
        <Loader2
          className={`w-5 h-5 text-primary transition-opacity ${pulling || refreshing ? "opacity-100" : "opacity-0"} ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: `rotate(${(pullY / THRESHOLD) * 180}deg)` }}
        />
      </div>
      <div style={{ transform: `translateY(${pullY}px)`, transition: pulling ? "none" : "transform 0.3s ease" }}>
        {children}
      </div>
    </div>
  );
}