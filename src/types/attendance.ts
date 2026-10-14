export type AttendanceStatus = "present" | "late" | "early_exit" | "absent" | "on_leave" | "half_day";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  branchName: string;
  branchId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workedHours: number;
  expectedHours: number;
  status: AttendanceStatus;
  deviceId?: string;
  deviceName?: string;
  notes?: string;
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  gracePeriodMinutes: number;
  breakDurationMinutes: number;
  branchIds: string[];
  departmentIds: string[];
  activeEmployeesCount: number;
  status: "active" | "inactive";
}

export interface BiometricDevice {
  id: string;
  name: string;
  brand: string; // e.g. "ZKTeco ProFace X", "Hikvision FaceStation"
  model: string;
  branchId: string;
  branchName: string;
  ipAddress: string;
  port: number;
  connectionType: "TCP/IP" | "RS485" | "Cloud";
  status: "connected" | "syncing" | "offline" | "error";
  lastSyncAt: string;
  totalPunchesToday: number;
}
