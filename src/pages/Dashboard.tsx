import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Users, Sun, Moon, AlertTriangle, Download, RotateCcw, Phone } from "lucide-react";
import { getDashboardStats, exportCSV, resetTodayScans, type Student } from "@/lib/storage";

// Animated counter component
const AnimatedCounter = ({
  value,
  label,
  icon: Icon,
  color,
  delay = 0,
}: {
  value: number;
  label: string;
  icon: React.ElementType;
  color: string;
  delay?: number;
}) => {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const duration = 800;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(tick);
    }, delay);
    prevValue.current = end;
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="glass-card-hover gradient-border p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`mono mt-2 text-4xl font-bold ${color}`}>{display}</p>
        </div>
        <div className={`rounded-xl p-3 ${color} bg-current/10`} style={{ backgroundColor: 'transparent' }}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(getDashboardStats());

  // Auto-refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getDashboardStats());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const csv = exportCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `missing-students-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm("Reset all scans for today?")) {
      resetTodayScans();
      setStats(getDashboardStats());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-4xl px-4 py-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="gradient-text text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="glass-card flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="btn-glow flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AnimatedCounter
          value={stats.morningCount}
          label="Morning Scans"
          icon={Sun}
          color="text-neon-blue"
          delay={0}
        />
        <AnimatedCounter
          value={stats.eveningCount}
          label="Evening Scans"
          icon={Moon}
          color="text-neon-purple"
          delay={150}
        />
        <AnimatedCounter
          value={stats.missingStudents.length}
          label="Missing Students"
          icon={AlertTriangle}
          color="text-neon-orange"
          delay={300}
        />
      </div>

      {/* Missing Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="glass-card gradient-border overflow-hidden"
      >
        <div className="flex items-center gap-3 border-b border-border p-5">
          <AlertTriangle className="h-5 w-5 text-neon-orange" />
          <h2 className="text-lg font-bold text-foreground">Missing Students</h2>
          <span className="ml-auto rounded-full bg-neon-orange/20 px-3 py-0.5 text-xs font-semibold text-neon-orange">
            {stats.missingStudents.length}
          </span>
        </div>

        {stats.missingStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">No missing students</p>
            <p className="mt-1 text-xs opacity-60">
              Students who scanned in morning but not evening will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Reg. No</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Department</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                </tr>
              </thead>
              <tbody>
                {stats.missingStudents.map((student, i) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-4 font-medium">{student.name}</td>
                    <td className="mono px-5 py-4 text-muted-foreground">{student.registerNumber}</td>
                    <td className="hidden px-5 py-4 text-muted-foreground sm:table-cell">
                      {student.department}
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-neon-blue">
                        <Phone className="h-3.5 w-3.5" />
                        {student.phone}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
