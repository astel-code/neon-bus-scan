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
  morningTime?: string;
  eveningTime?: string;
  date: string;
}

// Pre-seeded student database with barcode IDs
const DEFAULT_STUDENTS: Student[] = [
  { id: "STU001", barcode: "10248", name: "Ethan Thomas Binu", registerNumber: "VML25CS114", college: "Vimal Jyothi Engineering College", department: "Computer Science", phone: "9846423448" },
  { id: "STU002", barcode: "10249", name: "Priya Sharma", registerNumber: "VML25EC102", college: "Vimal Jyothi Engineering College", department: "Electronics", phone: "9876543211" },
  { id: "STU003", barcode: "10250", name: "Rahul Verma", registerNumber: "VML25ME103", college: "Vimal Jyothi Engineering College", department: "Mechanical", phone: "9876543212" },
  { id: "STU004", barcode: "10251", name: "Sneha Patel", registerNumber: "VML25CS104", college: "Vimal Jyothi Engineering College", department: "Computer Science", phone: "9876543213" },
  { id: "STU005", barcode: "10252", name: "Vikram Singh", registerNumber: "VML25EE105", college: "Vimal Jyothi Engineering College", department: "Electrical", phone: "9876543214" },
  { id: "STU006", barcode: "10253", name: "Divya Nair", registerNumber: "VML25CS106", college: "Vimal Jyothi Engineering College", department: "Computer Science", phone: "9876543215" },
  { id: "STU007", barcode: "10254", name: "Karthik Raj", registerNumber: "VML25ME107", college: "Vimal Jyothi Engineering College", department: "Mechanical", phone: "9876543216" },
  { id: "STU008", barcode: "10255", name: "Anjali Gupta", registerNumber: "VML25EC108", college: "Vimal Jyothi Engineering College", department: "Electronics", phone: "9876543217" },
  { id: "STU009", barcode: "10256", name: "Mohammed Arif", registerNumber: "VML25CS109", college: "Vimal Jyothi Engineering College", department: "Computer Science", phone: "9876543218" },
  { id: "STU010", barcode: "10257", name: "Lakshmi Iyer", registerNumber: "VML25EE110", college: "Vimal Jyothi Engineering College", department: "Electrical", phone: "9876543219" },
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

export function getStudentById(id: string): Student | undefined {
  return getStudents().find((s) => s.id === id);
}

/** Look up student by barcode number */
export function getStudentByBarcode(barcode: string): Student | undefined {
  return getStudents().find((s) => s.barcode === barcode);
}

export function getTodayScans(): ScanRecord[] {
  const stored = localStorage.getItem(SCANS_KEY);
  if (!stored) return [];
  const allScans: ScanRecord[] = JSON.parse(stored);
  return allScans.filter((s) => s.date === getTodayStr());
}

export function recordScan(
  barcode: string,
  mode: "morning" | "evening"
): { success: boolean; duplicate: boolean; student?: Student; scanTime?: string } {
  const student = getStudentByBarcode(barcode);
  if (!student) return { success: false, duplicate: false };

  const today = getTodayStr();
  const stored = localStorage.getItem(SCANS_KEY);
  const allScans: ScanRecord[] = stored ? JSON.parse(stored) : [];

  const existing = allScans.find((s) => s.studentId === student.id && s.date === today);
  const scanTime = new Date().toLocaleTimeString();

  if (existing) {
    if (mode === "morning" && existing.morningTime) {
      return { success: false, duplicate: true, student };
    }
    if (mode === "evening" && existing.eveningTime) {
      return { success: false, duplicate: true, student };
    }
    existing[mode === "morning" ? "morningTime" : "eveningTime"] = scanTime;
  } else {
    allScans.push({
      studentId: student.id,
      date: today,
      ...(mode === "morning"
        ? { morningTime: scanTime }
        : { eveningTime: scanTime }),
    });
  }

  localStorage.setItem(SCANS_KEY, JSON.stringify(allScans));
  return { success: true, duplicate: false, student, scanTime };
}

export function getDashboardStats() {
  const scans = getTodayScans();
  const students = getStudents();
  const morningCount = scans.filter((s) => s.morningTime).length;
  const eveningCount = scans.filter((s) => s.eveningTime).length;

  const missingStudents = scans
    .filter((s) => s.morningTime && !s.eveningTime)
    .map((s) => {
      const student = getStudentById(s.studentId);
      return student ? { ...student, morningTime: s.morningTime! } : null;
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
