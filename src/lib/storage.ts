// Local storage utility for QR bus verification system

export interface Student {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  phone: string;
}

export interface ScanRecord {
  studentId: string;
  morningTime?: string;
  eveningTime?: string;
  date: string;
}

// Pre-seeded student database
const DEFAULT_STUDENTS: Student[] = [
  { id: "STU001", name: "Arun Kumar", registerNumber: "21CS101", department: "Computer Science", phone: "+91 98765 43210" },
  { id: "STU002", name: "Priya Sharma", registerNumber: "21EC102", department: "Electronics", phone: "+91 98765 43211" },
  { id: "STU003", name: "Rahul Verma", registerNumber: "21ME103", department: "Mechanical", phone: "+91 98765 43212" },
  { id: "STU004", name: "Sneha Patel", registerNumber: "21CS104", department: "Computer Science", phone: "+91 98765 43213" },
  { id: "STU005", name: "Vikram Singh", registerNumber: "21EE105", department: "Electrical", phone: "+91 98765 43214" },
  { id: "STU006", name: "Divya Nair", registerNumber: "21CS106", department: "Computer Science", phone: "+91 98765 43215" },
  { id: "STU007", name: "Karthik Raj", registerNumber: "21ME107", department: "Mechanical", phone: "+91 98765 43216" },
  { id: "STU008", name: "Anjali Gupta", registerNumber: "21EC108", department: "Electronics", phone: "+91 98765 43217" },
  { id: "STU009", name: "Mohammed Arif", registerNumber: "21CS109", department: "Computer Science", phone: "+91 98765 43218" },
  { id: "STU010", name: "Lakshmi Iyer", registerNumber: "21EE110", department: "Electrical", phone: "+91 98765 43219" },
];

const STUDENTS_KEY = "qr_bus_students";
const SCANS_KEY = "qr_bus_scans";

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

export function getStudentById(id: string): Student | undefined {
  return getStudents().find((s) => s.id === id);
}

export function getTodayScans(): ScanRecord[] {
  const stored = localStorage.getItem(SCANS_KEY);
  if (!stored) return [];
  const allScans: ScanRecord[] = JSON.parse(stored);
  return allScans.filter((s) => s.date === getTodayStr());
}

export function recordScan(
  studentId: string,
  mode: "morning" | "evening"
): { success: boolean; duplicate: boolean; student?: Student } {
  const student = getStudentById(studentId);
  if (!student) return { success: false, duplicate: false };

  const today = getTodayStr();
  const stored = localStorage.getItem(SCANS_KEY);
  const allScans: ScanRecord[] = stored ? JSON.parse(stored) : [];

  const existing = allScans.find((s) => s.studentId === studentId && s.date === today);

  if (existing) {
    if (mode === "morning" && existing.morningTime) {
      return { success: false, duplicate: true, student };
    }
    if (mode === "evening" && existing.eveningTime) {
      return { success: false, duplicate: true, student };
    }
    // Update existing record
    existing[mode === "morning" ? "morningTime" : "eveningTime"] = new Date().toLocaleTimeString();
  } else {
    allScans.push({
      studentId,
      date: today,
      ...(mode === "morning"
        ? { morningTime: new Date().toLocaleTimeString() }
        : { eveningTime: new Date().toLocaleTimeString() }),
    });
  }

  localStorage.setItem(SCANS_KEY, JSON.stringify(allScans));
  return { success: true, duplicate: false, student };
}

export function getDashboardStats() {
  const scans = getTodayScans();
  const students = getStudents();
  const morningCount = scans.filter((s) => s.morningTime).length;
  const eveningCount = scans.filter((s) => s.eveningTime).length;

  // Missing = scanned morning but NOT scanned evening
  const missingStudents = scans
    .filter((s) => s.morningTime && !s.eveningTime)
    .map((s) => {
      const student = getStudentById(s.studentId);
      return student
        ? { ...student, morningTime: s.morningTime! }
        : null;
    })
    .filter(Boolean) as (Student & { morningTime: string })[];

  return { morningCount, eveningCount, missingStudents, totalStudents: students.length };
}

export function exportCSV(): string {
  const stats = getDashboardStats();
  const headers = "Name,Register Number,Department,Phone,Morning Time\n";
  const rows = stats.missingStudents
    .map((s) => `${s.name},${s.registerNumber},${s.department},${s.phone},${s.morningTime}`)
    .join("\n");
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
