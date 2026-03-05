import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, AlertTriangle, Download, RotateCcw, Phone, Sun, Moon } from "lucide-react";
import { getDashboardStats, exportCSV, resetTodayScans, resetStudentDatabase, type Student } from "@/lib/storage";

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
    if (start === end) { setDisplay(end); return; }
    const duration = 800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => requestAnimationFrame(tick), delay);
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
        <div className="rounded-xl p-3" style={{ backgroundColor: 'transparent' }}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
};

// Student table component
const StudentTable = ({
  title,
  icon: Icon,
  iconColor,
  badgeColor,
  students,
  count,
  showDetails,
  emptyMessage,
  animDelay,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  badgeColor: string;
  students: Student[];
  count: number;
  showDetails: boolean;
  emptyMessage: string;
  animDelay: number;
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: animDelay, duration: 0.5 }}
    className="glass-card gradient-border overflow-hidden">
    <div className="flex items-center gap-3 border-b border-border p-5">
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <span className={`ml-auto rounded-full px-3 py-0.5 text-xs font-semibold ${badgeColor}`}>{count}</span>
    </div>
    {count === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Icon className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Reg. No</th>
              {showDetails && <th className="hidden px-5 py-3 font-medium sm:table-cell">Department</th>}
              {showDetails && <th className="px-5 py-3 font-medium">Phone</th>}
            </tr>
          </thead>
          <tbody>
            {students.map((student, i) => (
              <motion.tr key={student.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: animDelay + 0.1 + i * 0.08 }} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                <td className="px-5 py-4 font-medium">{student.name}</td>
                <td className="mono px-5 py-4 text-muted-foreground">{student.registerNumber}</td>
                {showDetails && <td className="hidden px-5 py-4 text-muted-foreground sm:table-cell">{student.department}</td>}
                {showDetails && (
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-neon-blue">
                      <Phone className="h-3.5 w-3.5" />{student.phone}
                    </span>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(getDashboardStats());

  useEffect(() => { resetStudentDatabase(); }, []);
  useEffect(() => {
    const interval = setInterval(() => setStats(getDashboardStats()), 2000);
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="gradient-text text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleReset}
            className="glass-card flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <RotateCcw className="h-4 w-4" /> Reset
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExport}
            className="btn-glow flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
            <Download className="h-4 w-4" /> Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid - 5 counters */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <AnimatedCounter value={stats.totalStudents} label="Total Students" icon={Users} color="text-neon-blue" delay={0} />
        <AnimatedCounter value={stats.morningPresentCount} label="Morning Present" icon={Sun} color="text-neon-green" delay={100} />
        <AnimatedCounter value={stats.morningMissingCount} label="Morning Missing" icon={AlertTriangle} color="text-neon-orange" delay={200} />
        <AnimatedCounter value={stats.eveningPresentCount} label="Evening Present" icon={Moon} color="text-neon-green" delay={300} />
        <AnimatedCounter value={stats.eveningMissingCount} label="Evening Missing" icon={AlertTriangle} color="text-neon-pink" delay={400} />
      </div>

      {/* 4 sections */}
      <div className="space-y-8">
        <StudentTable title="Morning Present" icon={UserCheck} iconColor="text-neon-green" badgeColor="bg-neon-green/20 text-neon-green"
          students={stats.morningPresent} count={stats.morningPresentCount} showDetails={false} emptyMessage="No morning scans yet" animDelay={0.3} />

        <StudentTable title="Morning Missing" icon={AlertTriangle} iconColor="text-neon-orange" badgeColor="bg-neon-orange/20 text-neon-orange"
          students={stats.morningMissing} count={stats.morningMissingCount} showDetails={true} emptyMessage="All students scanned for morning!" animDelay={0.4} />

        <StudentTable title="Evening Present" icon={UserCheck} iconColor="text-neon-green" badgeColor="bg-neon-green/20 text-neon-green"
          students={stats.eveningPresent} count={stats.eveningPresentCount} showDetails={false} emptyMessage="No evening scans yet" animDelay={0.5} />

        <StudentTable title="Evening Missing" icon={AlertTriangle} iconColor="text-neon-pink" badgeColor="bg-neon-pink/20 text-neon-pink"
          students={stats.eveningMissing} count={stats.eveningMissingCount} showDetails={true}
          emptyMessage="No students missing for evening return" animDelay={0.6} />
      </div>
    </motion.div>
  );
};

export default Dashboard;
