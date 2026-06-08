import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, BellRing, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

export default function PushNotificationSetup() {
  const [status, setStatus] = useState("unknown"); // unknown | unsupported | denied | granted | prompt | subscribed
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'prompt');
  }, []);

  // Already dismissed this session
  useEffect(() => {
    if (sessionStorage.getItem('push_dismissed')) setDismissed(true);
  }, []);

  const subscribe = async () => {
    if (!VAPID_PUBLIC_KEY) {
      alert("Push notifications are not configured yet. Ask the admin to add VITE_VAPID_PUBLIC_KEY.");
      return;
    }
    setLoading(true);
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus('denied');
      setLoading(false);
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await base44.functions.invoke('savePushSubscription', { subscription: sub.toJSON() });
    setStatus('subscribed');
    setLoading(false);
  };

  const dismiss = () => {
    sessionStorage.setItem('push_dismissed', '1');
    setDismissed(true);
  };

  if (status === 'unsupported' || status === 'denied' || status === 'subscribed' || status === 'granted' || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mx-5 mb-4 rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-start gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <BellRing className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Enable push notifications</p>
          <p className="text-xs text-muted-foreground mt-0.5">Get instant alerts for new loan requests and return reminders on your phone.</p>
          <Button
            size="sm"
            className="mt-2.5 h-8 rounded-xl text-xs bg-primary gap-1.5"
            onClick={subscribe}
            disabled={loading}
          >
            {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
            Turn on notifications
          </Button>
        </div>
        <button onClick={dismiss} className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}