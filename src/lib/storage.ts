// Local storage utility for Barcode Bus Verification System

export interface Student {
  id: string;
  barcode: string;
  name: string;
  registerNumber: string;
  department: string;
  college: string;
  phone: string;
}

export interface ScanRecord {
  studentId: string;
  scanTime: string;
  mode: "morning" | "evening";
  date: string;
}

// Pre-seeded student database
const DEFAULT_STUDENTS: Student[] = [
  { id: "STU001", barcode: "10248", name: "Ethan Thomas Binu", registerNumber: "VML25CS114", college: "Vimal Jyothi Engineering College", department: "Computer Science", phone: "9846423448" },
  { id: "STU002", barcode: "10335", name: "Avani Pavanan", registerNumber: "VML25CS081", college: "Vimal Jyothi Engineering College", department: "Computer Science", phone: "9846423448" },
  { id: "STU003", barcode: "10307", name: "Abhinand K", registerNumber: "VML25CS012", college: "Vimal Jyothi Engineering College", department: "Computer Science", phone: "9846423448" },
  { id: "STU004", barcode: "10247", name: "Josha Manoj K", registerNumber: "VML25CS142", college: "Vimal Jyothi Engineering College", department: "Computer Science", phone: "9846423448" },
  { id: "STU005", barcode: "10473", name: "Fathima Rena", registerNumber: "VML25CS117", college: "Vimal Jyothi Engineering College", department: "Computer Science", phone: "9846423448" },
];

const STUDENTS_KEY = "barcode_bus_students";
const SCANS_KEY = "barcode_bus_scans";

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function getStudents(): Student[] {
  const stored = localStorage.getItem(STUDENTS_KEY);
  if (!stored) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(DEFAULT_STUDENTS));
    return DEFAULT_STUDENTS;
  }
  return JSON.parse(stored);
}

/** Force-reset student database to defaults (useful when student list changes) */
export function resetStudentDatabase(): void {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(DEFAULT_STUDENTS));
}

export function getStudentById(id: string): Student | undefined {
  return getStudents().find((s) => s.id === id);
}

export function getStudentByBarcode(barcode: string): Student | undefined {
  return getStudents().find((s) => s.barcode === barcode);
}

export function getTodayScans(): ScanRecord[] {
  const stored = localStorage.getItem(SCANS_KEY);
  if (!stored) return [];
  const allScans: ScanRecord[] = JSON.parse(stored);
  return allScans.filter((s) => s.date === getTodayStr());
}

/** Record a scan. Returns success/duplicate/not-found status. */
export function recordScan(
  barcode: string,
  mode: "morning" | "evening"
): { success: boolean; duplicate: boolean; student?: Student; scanTime?: string } {
  const student = getStudentByBarcode(barcode);
  if (!student) return { success: false, duplicate: false };

  const today = getTodayStr();
  const stored = localStorage.getItem(SCANS_KEY);
  const allScans: ScanRecord[] = stored ? JSON.parse(stored) : [];

  // Check for duplicate: same student, same mode, same day
  const alreadyScanned = allScans.some(
    (s) => s.studentId === student.id && s.date === today && s.mode === mode
  );
  if (alreadyScanned) {
    return { success: false, duplicate: true, student };
  }

  const scanTime = new Date().toLocaleTimeString();
  allScans.push({ studentId: student.id, date: today, scanTime, mode });

  localStorage.setItem(SCANS_KEY, JSON.stringify(allScans));
  return { success: true, duplicate: false, student, scanTime };
}

/** Dashboard stats: separate morning and evening tracking */
export function getDashboardStats() {
  const scans = getTodayScans();
  const students = getStudents();

  // Morning: scanned = present, unscanned = missing
  const morningScannedIds = new Set(
    scans.filter((s) => s.mode === "morning").map((s) => s.studentId)
  );
  const morningPresent = students.filter((s) => morningScannedIds.has(s.id));
  const morningMissing = students.filter((s) => !morningScannedIds.has(s.id));

  // Evening: only students who scanned in morning but NOT in evening are "evening missing"
  const eveningScannedIds = new Set(
    scans.filter((s) => s.mode === "evening").map((s) => s.studentId)
  );
  const eveningPresent = students.filter((s) => eveningScannedIds.has(s.id));
  const eveningMissing = students.filter(
    (s) => morningScannedIds.has(s.id) && !eveningScannedIds.has(s.id)
  );

  return {
    totalStudents: students.length,
    morningPresentCount: morningPresent.length,
    morningMissingCount: morningMissing.length,
    eveningPresentCount: eveningPresent.length,
    eveningMissingCount: eveningMissing.length,
    morningPresent,
    morningMissing,
    eveningPresent,
    eveningMissing,
  };
}

export function exportCSV(): string {
  const stats = getDashboardStats();
  const headers = "Section,Name,Register Number,Department,Phone\n";
  const formatRows = (list: Student[], section: string) =>
    list.map((s) => `${section},${s.name},${s.registerNumber},${s.department},${s.phone}`).join("\n");
  const rows = [
    formatRows(stats.morningMissing, "Morning Missing"),
    formatRows(stats.eveningMissing, "Evening Missing"),
  ].filter(Boolean).join("\n");
  return headers + rows;
}

export function resetTodayScans() {
  const stored = localStorage.getItem(SCANS_KEY);
  if (!stored) return;
  const allScans: ScanRecord[] = JSON.parse(stored);
  const today = getTodayStr();
  const filtered = allScans.filter((s) => s.date !== today);
  localStorage.setItem(SCANS_KEY, JSON.stringify(filtered));
}
