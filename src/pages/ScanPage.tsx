import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, AlertTriangle, ScanLine, Sun, Moon, Clock } from "lucide-react";
import { recordScan, getStudentByBarcode, type Student } from "@/lib/storage";
import BarcodeScanner from "@/components/BarcodeScanner";

type ScanMode = "morning" | "evening";

interface ScanResult {
  type: "success" | "duplicate" | "error";
  student?: Student;
  message: string;
  scanTime?: string;
}

const ScanPage = () => {
  const [mode, setMode] = useState<ScanMode>("morning");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = useCallback(
    (barcode: string) => {
      // Stop scanner after reading
      setScanning(false);

      const res = recordScan(barcode, mode);

      if (res.duplicate) {
        setResult({
          type: "duplicate",
          student: res.student,
          message: `Already scanned for ${mode}!`,
        });
      } else if (res.success && res.student) {
        setResult({
          type: "success",
          student: res.student,
          message: `${mode === "morning" ? "Morning" : "Evening"} scan recorded!`,
          scanTime: res.scanTime,
        });
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#06b6d4", "#a855f7", "#ec4899"],
        });
      } else {
        setResult({
          type: "error",
          message: `Student not found for barcode: ${barcode}`,
        });
      }
    },
    [mode]
  );

  const handleManualScan = (barcode: string) => {
    handleScan(barcode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-lg px-4 py-8"
    >
      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card mb-8 flex items-center justify-center gap-2 p-2"
      >
        {(["morning", "evening"] as ScanMode[]).map((m) => (
          <motion.button
            key={m}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setMode(m);
              setResult(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              mode === m
                ? "bg-primary/20 text-primary neon-glow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "morning" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {m === "morning" ? "Morning" : "Evening"}
          </motion.button>
        ))}
      </motion.div>

      {/* Scanner Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card gradient-border mb-8 overflow-hidden p-6"
      >
        <div className="mb-4 text-center">
          <h2 className="gradient-text text-xl font-bold">
            {mode === "morning" ? "Morning Boarding" : "Evening Return"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Position the barcode within the scanner frame
          </p>
        </div>

        {/* Scanner Area */}
        <div className="relative mx-auto mb-6 aspect-video max-w-[320px] overflow-hidden rounded-xl bg-muted/50">
          {scanning ? (
            <>
              <BarcodeScanner onScan={handleScan} active={scanning} />
              {/* Animated scan line overlay */}
              <div className="pointer-events-none absolute inset-0">
                <motion.div
                  className="absolute left-4 right-4 h-0.5 bg-neon-blue"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ boxShadow: "0 0 12px hsl(200 95% 50% / 0.8)" }}
                />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-2xl bg-primary/10 p-4"
              >
                <ScanLine className="h-12 w-12 text-primary" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Tap below to start scanning</p>
            </div>
          )}
        </div>

        {/* Scan Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setScanning((prev) => !prev);
            setResult(null);
          }}
          className={`btn-glow w-full rounded-xl py-3.5 text-sm font-bold transition-all ${
            scanning
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {scanning ? "Stop Scanner" : "Start Barcode Scanner"}
        </motion.button>
      </motion.div>

      {/* Result Popup */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`glass-card gradient-border p-6 ${
              result.type === "success"
                ? "neon-glow-blue"
                : result.type === "duplicate"
                ? "neon-glow"
                : ""
            }`}
          >
            <div className="flex flex-col items-center text-center">
              {result.type === "success" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                  className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-neon-green/20"
                >
                  <Check className="h-8 w-8 text-neon-green" />
                </motion.div>
              )}
              {(result.type === "duplicate" || result.type === "error") && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full ${
                    result.type === "duplicate" ? "bg-neon-orange/20" : "bg-destructive/20"
                  }`}
                >
                  <AlertTriangle
                    className={`h-8 w-8 ${
                      result.type === "duplicate" ? "text-neon-orange" : "text-destructive"
                    }`}
                  />
                </motion.div>
              )}

              <h3 className="text-lg font-bold text-foreground">{result.message}</h3>

              {result.student && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 w-full space-y-2 rounded-xl bg-muted/50 p-4 text-left text-sm"
                >
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{result.student.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reg. No</span>
                    <span className="mono font-medium">{result.student.registerNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dept</span>
                    <span className="font-medium">{result.student.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{result.student.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode</span>
                    <span className="font-medium capitalize">{mode}</span>
                  </div>
                  {result.scanTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5 text-neon-blue" />
                        {result.scanTime}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setResult(null)}
                className="mt-4 rounded-lg bg-muted px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
              >
                Scan Another
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Quick Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <p className="mb-3 text-center text-xs text-muted-foreground">
          Demo: Quick scan buttons (simulates barcodes)
        </p>
        <div className="grid grid-cols-5 gap-2">
          {[
            { barcode: "10248", label: "10248" },
            { barcode: "10249", label: "10249" },
            { barcode: "10250", label: "10250" },
            { barcode: "10251", label: "10251" },
            { barcode: "10252", label: "10252" },
            { barcode: "10253", label: "10253" },
            { barcode: "10254", label: "10254" },
            { barcode: "10255", label: "10255" },
            { barcode: "10256", label: "10256" },
            { barcode: "10257", label: "10257" },
          ].map(({ barcode, label }) => (
            <motion.button
              key={barcode}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleManualScan(barcode)}
              className="glass-card rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScanPage;
