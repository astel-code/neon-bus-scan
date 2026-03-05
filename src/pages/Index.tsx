import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ScanLine, LayoutDashboard, Bus, Shield } from "lucide-react";

const Index = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16"
    >
      {/* Hero */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 neon-glow"
      >
        <Bus className="h-10 w-10 text-primary" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="gradient-text mb-3 text-center text-4xl font-extrabold tracking-tight sm:text-5xl"
      >
        Smart Ride System
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-2 max-w-md text-center text-lg text-muted-foreground"
      >
        Student Bus Attendance
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-2 max-w-md text-center text-sm font-medium text-primary/70"
      >
        Barcode Based Student Bus Attendance Tracking
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-10 flex items-center gap-2 text-xs text-muted-foreground/60"
      >
        <Shield className="h-3.5 w-3.5" />
        Secure • Real-time • Automated
      </motion.div>

      {/* Action Cards */}
      <div className="grid w-full max-w-md gap-4">
        <Link to="/scan">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card-hover gradient-border flex items-center gap-5 p-5"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neon-blue/15">
              <ScanLine className="h-7 w-7 text-neon-blue" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Scan Barcode</h3>
              <p className="text-sm text-muted-foreground">Morning & evening boarding verification</p>
            </div>
          </motion.div>
        </Link>

        <Link to="/dashboard">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card-hover gradient-border flex items-center gap-5 p-5"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neon-purple/15">
              <LayoutDashboard className="h-7 w-7 text-neon-purple" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Admin Dashboard</h3>
              <p className="text-sm text-muted-foreground">View stats, missing students & export data</p>
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
};

export default Index;
