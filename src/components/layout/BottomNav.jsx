import { Link, useLocation } from "react-router-dom";
import { Home, Plus, Clock, User } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/create", icon: Plus, label: "Lend", primary: true },
  { path: "/activity", icon: Clock, label: "Activity" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {navItems.map(({ path, icon: Icon, label, primary }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 ${
                primary
                  ? "relative"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {primary ? (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 -mt-5 border-4 border-background">
                  <Icon className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
              ) : (
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
              )}
              <span className={`text-[10px] font-medium ${primary ? "text-primary font-semibold" : isActive ? "font-semibold" : ""}`}>
                {label}
              </span>
              {!primary && isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}