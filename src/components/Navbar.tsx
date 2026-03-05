import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanLine, LayoutDashboard, Bus } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const links = [
    { to: "/scan", label: "Scanner", icon: ScanLine },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass-card sticky top-0 z-50 mx-auto mt-4 flex max-w-3xl items-center justify-between rounded-2xl px-6 py-3"
    >
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 neon-glow">
          <Bus className="h-5 w-5 text-neon-purple" />
        </div>
        <span className="gradient-text text-lg font-bold tracking-tight">Smart Ride</span>
      </Link>

      <div className="flex gap-1">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/20 text-primary neon-glow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default Navbar;
