/**
 * OrbitERP Typed Mock API Service Layer
 *
 * NOTE: These typed services simulate API responses using predictable in-memory data.
 * When the Express.js + PostgreSQL + Prisma backend is connected, replace the contents
 * of these functions with real `apiRequest<T>()` calls without changing component interfaces.
 */

import { mockStore } from "./store";
import { Employee, CreateEmployeeInput, UpdateEmployeeInput } from "@/types/employee";
import { Branch } from "@/types/organization";
import { AttendanceRecord, Shift, BiometricDevice } from "@/types/attendance";
import { LeaveRequest, LeaveBalance, LeaveStatus } from "@/types/leave";
import { CustomFieldDefinition, CustomFieldEntity } from "@/types/custom-field";
import { WorkflowDefinition } from "@/types/workflow";
import { SaasModule } from "@/types/module";
import { Role } from "@/types/role";
import { SubscriptionPlan, UsageMetric, Invoice } from "@/types/billing";

// Helper delay to mimic brief micro-latency if needed
export async function simulateDelay(ms = 60): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Organization Services ---
export async function getCurrentOrganization() {
  await simulateDelay();
  return mockStore.getCurrentOrg();
}

export async function listOrganizations() {
  await simulateDelay();
  return mockStore.organizations;
}

export async function switchOrganization(orgId: string) {
  await simulateDelay();
  mockStore.setCurrentOrg(orgId);
  return mockStore.getCurrentOrg();
}

export async function updateOrganizationProfile(updates: Parameters<typeof mockStore.updateCurrentOrg>[0]) {
  await simulateDelay();
  mockStore.updateCurrentOrg(updates);
  return mockStore.getCurrentOrg();
}

// --- Branch Services ---
export async function listBranches(search?: string): Promise<Branch[]> {
  await simulateDelay();
  const branches = mockStore.getBranches();
  if (!search) return branches;
  const q = search.toLowerCase();
  return branches.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q)
  );
}

export async function createBranch(input: Omit<Branch, "id" | "employeeCount">): Promise<Branch> {
  await simulateDelay();
  return mockStore.createBranch(input);
}

export async function updateBranch(id: string, updates: Partial<Branch>): Promise<Branch | undefined> {
  await simulateDelay();
  return mockStore.updateBranch(id, updates);
}

// --- Employee Services ---
export async function listEmployees(filters?: {
  search?: string;
  branchId?: string;
  departmentId?: string;
  status?: string;
}): Promise<Employee[]> {
  await simulateDelay();
  let list = mockStore.getEmployees();

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q)
    );
  }

  if (filters?.branchId && filters.branchId !== "all") {
    list = list.filter((e) => e.branchId === filters.branchId);
  }

  if (filters?.departmentId && filters.departmentId !== "all") {
    list = list.filter((e) => e.departmentId === filters.departmentId);
  }

  if (filters?.status && filters.status !== "all") {
    list = list.filter((e) => e.status === filters.status);
  }

  return list;
}

export async function getEmployee(id: string): Promise<Employee | undefined> {
  await simulateDelay();
  return mockStore.getEmployee(id);
}

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  await simulateDelay();
  return mockStore.createEmployee(input);
}

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput
): Promise<Employee | undefined> {
  await simulateDelay();
  return mockStore.updateEmployee(id, input);
}

export async function deleteEmployee(id: string): Promise<boolean> {
  await simulateDelay();
  mockStore.deleteEmployee(id);
  return true;
}

// --- Attendance Services ---
export async function listAttendance(filters?: {
  date?: string;
  branchId?: string;
  departmentName?: string;
  status?: string;
  search?: string;
}): Promise<AttendanceRecord[]> {
  await simulateDelay();
  let list = mockStore.getAttendance();

  if (filters?.date) {
    list = list.filter((a) => a.date === filters.date);
  }

  if (filters?.branchId && filters.branchId !== "all") {
    list = list.filter((a) => a.branchId === filters.branchId);
  }

  if (filters?.departmentName && filters.departmentName !== "all") {
    list = list.filter((a) => a.departmentName === filters.departmentName);
  }

  if (filters?.status && filters.status !== "all") {
    list = list.filter((a) => a.status === filters.status);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.employeeName.toLowerCase().includes(q) ||
        a.employeeCode.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function listShifts(): Promise<Shift[]> {
  await simulateDelay();
  return mockStore.getShifts();
}

export async function createShift(shift: Omit<Shift, "id" | "activeEmployeesCount">): Promise<Shift> {
  await simulateDelay();
  return mockStore.createShift(shift);
}

export async function updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined> {
  await simulateDelay();
  return mockStore.updateShift(id, updates);
}

export async function listBiometricDevices(): Promise<BiometricDevice[]> {
  await simulateDelay();
  return mockStore.getDevices();
}

export async function connectBiometricDevice(
  input: Omit<BiometricDevice, "id" | "lastSyncAt" | "totalPunchesToday">
): Promise<BiometricDevice> {
  await simulateDelay();
  return mockStore.createDevice(input);
}

export async function triggerDeviceSync(id: string): Promise<void> {
  await simulateDelay();
  mockStore.syncDevice(id);
}

// CSV Export Generator for Attendance
export function generateAttendanceCsv(records: AttendanceRecord[]): string {
  const headers = [
    "Date",
    "Employee Code",
    "Employee Name",
    "Department",
    "Branch",
    "Check In",
    "Check Out",
    "Worked Hours",
    "Expected Hours",
    "Status",
    "Device / Notes",
  ];

  const rows = records.map((r) => [
    `"${r.date}"`,
    `"${r.employeeCode}"`,
    `"${r.employeeName}"`,
    `"${r.departmentName}"`,
    `"${r.branchName}"`,
    `"${r.checkIn || "—"}"`,
    `"${r.checkOut || "—"}"`,
    r.workedHours.toString(),
    r.expectedHours.toString(),
    `"${r.status}"`,
    `"${r.deviceName || r.notes || "—"}"`,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

// --- Leave Services ---
export async function listLeaveRequests(filters?: {
  status?: LeaveStatus | "all";
  leaveType?: string;
  search?: string;
}): Promise<LeaveRequest[]> {
  await simulateDelay();
  let list = mockStore.getLeaveRequests();

  if (filters?.status && filters.status !== "all") {
    list = list.filter((r) => r.status === filters.status);
  }

  if (filters?.leaveType && filters.leaveType !== "all") {
    list = list.filter((r) => r.leaveType === filters.leaveType);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeCode.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getLeaveBalances(): Promise<LeaveBalance[]> {
  await simulateDelay();
  return mockStore.leaveBalances;
}

export async function createLeaveRequest(
  input: Omit<LeaveRequest, "id" | "appliedAt" | "status">
): Promise<LeaveRequest> {
  await simulateDelay();
  return mockStore.createLeaveRequest(input);
}

export async function updateLeaveStatus(
  id: string,
  status: LeaveStatus,
  reviewerName = "Alina Vance",
  comments?: string
): Promise<LeaveRequest | undefined> {
  await simulateDelay();
  return mockStore.updateLeaveStatus(id, status, reviewerName, comments);
}

// --- Custom Fields Services ---
export async function listCustomFields(entityType?: CustomFieldEntity): Promise<CustomFieldDefinition[]> {
  await simulateDelay();
  const fields = mockStore.getCustomFields();
  if (!entityType) return fields;
  return fields.filter((f) => f.entityType === entityType);
}

export async function createCustomField(
  field: Omit<CustomFieldDefinition, "id">
): Promise<CustomFieldDefinition> {
  await simulateDelay();
  return mockStore.createCustomField(field);
}

export async function updateCustomField(
  id: string,
  updates: Partial<CustomFieldDefinition>
): Promise<CustomFieldDefinition | undefined> {
  await simulateDelay();
  return mockStore.updateCustomField(id, updates);
}

export async function toggleCustomField(id: string): Promise<CustomFieldDefinition | undefined> {
  await simulateDelay();
  return mockStore.toggleCustomField(id);
}

// --- Workflow Services ---
export async function listWorkflows(): Promise<WorkflowDefinition[]> {
  await simulateDelay();
  return mockStore.getWorkflows();
}

export async function saveWorkflowDraft(
  workflow: WorkflowDefinition
): Promise<WorkflowDefinition> {
  await simulateDelay();
  return mockStore.saveWorkflow(workflow);
}

export async function publishWorkflow(id: string): Promise<WorkflowDefinition | undefined> {
  await simulateDelay();
  return mockStore.publishWorkflow(id);
}

// --- Module Activation Services ---
export async function listModules(): Promise<SaasModule[]> {
  await simulateDelay();
  return mockStore.getModules();
}

export async function toggleModule(
  moduleKey: string,
  enabled: boolean
): Promise<SaasModule | undefined> {
  await simulateDelay();
  return mockStore.toggleModule(moduleKey, enabled);
}

// --- Roles & Permissions Services ---
export async function listRoles(): Promise<Role[]> {
  await simulateDelay();
  return mockStore.getRoles();
}

export async function createRole(
  role: Omit<Role, "id" | "assignedMembersCount">
): Promise<Role> {
  await simulateDelay();
  return mockStore.createRole(role);
}

export async function updateRole(
  id: string,
  updates: Partial<Role>
): Promise<Role | undefined> {
  await simulateDelay();
  return mockStore.updateRole(id, updates);
}

// --- Billing Services ---
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  await simulateDelay();
  return mockStore.plans;
}

export async function getUsageMetrics(): Promise<UsageMetric[]> {
  await simulateDelay();
  return mockStore.usageMetrics;
}

export async function getInvoices(): Promise<Invoice[]> {
  await simulateDelay();
  return mockStore.invoices;
}

// --- Platform Admin Services ---
export async function getPlatformAdminData() {
  await simulateDelay();
  return mockStore.platformAdmin;
}

export async function toggleTenantStatus(tenantId: string): Promise<string | undefined> {
  await simulateDelay();
  return mockStore.toggleTenantStatus(tenantId);
}
