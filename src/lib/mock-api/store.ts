"use client";

import { useState, useEffect } from "react";
import {
  MOCK_ORGANIZATIONS,
  MOCK_BRANCHES,
  MOCK_DEPARTMENTS,
  MOCK_EMPLOYEES,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_SHIFTS,
  MOCK_BIOMETRIC_DEVICES,
  MOCK_LEAVE_REQUESTS,
  MOCK_LEAVE_BALANCES,
  MOCK_CUSTOM_FIELDS,
  MOCK_WORKFLOWS,
  MOCK_SAAS_MODULES,
  MOCK_ROLES,
  MOCK_ROLE_MEMBERS,
  MOCK_SUBSCRIPTION_PLANS,
  MOCK_USAGE_METRICS,
  MOCK_INVOICES,
  MOCK_PLATFORM_ADMIN_DATA,
  DEMO_USERS,
  DemoUserCredential,
} from "./data";
import { Organization, Branch, Department } from "@/types/organization";
import { Employee, CreateEmployeeInput, UpdateEmployeeInput } from "@/types/employee";
import { AttendanceRecord, Shift, BiometricDevice } from "@/types/attendance";
import { LeaveRequest, LeaveBalance, LeaveStatus } from "@/types/leave";
import { CustomFieldDefinition } from "@/types/custom-field";
import { WorkflowDefinition } from "@/types/workflow";
import { SaasModule } from "@/types/module";
import { Role, RoleMember } from "@/types/role";

// Global in-memory singleton for demo interactivity
class MockDataStore {
  currentUser: DemoUserCredential = DEMO_USERS[1]; // default: Org Admin (Alina Vance)
  organizations: Organization[] = [...MOCK_ORGANIZATIONS];
  currentOrgId: string = MOCK_ORGANIZATIONS[0].id;
  branches: Branch[] = [...MOCK_BRANCHES];
  departments: Department[] = [...MOCK_DEPARTMENTS];
  employees: Employee[] = [...MOCK_EMPLOYEES];
  attendance: AttendanceRecord[] = [...MOCK_ATTENDANCE_RECORDS];
  shifts: Shift[] = [...MOCK_SHIFTS];
  devices: BiometricDevice[] = [...MOCK_BIOMETRIC_DEVICES];
  leaveRequests: LeaveRequest[] = [...MOCK_LEAVE_REQUESTS];
  leaveBalances: LeaveBalance[] = [...MOCK_LEAVE_BALANCES];
  customFields: CustomFieldDefinition[] = [...MOCK_CUSTOM_FIELDS];
  workflows: WorkflowDefinition[] = [...MOCK_WORKFLOWS];
  modules: SaasModule[] = [...MOCK_SAAS_MODULES];
  roles: Role[] = [...MOCK_ROLES];
  roleMembers: RoleMember[] = [...MOCK_ROLE_MEMBERS];
  plans = [...MOCK_SUBSCRIPTION_PLANS];
  usageMetrics = [...MOCK_USAGE_METRICS];
  invoices = [...MOCK_INVOICES];
  platformAdmin = {
    ...MOCK_PLATFORM_ADMIN_DATA,
    tenantsList: [...MOCK_PLATFORM_ADMIN_DATA.tenantsList],
  };

  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Current User Session & Branch Scoping ---
  getCurrentUser(): DemoUserCredential {
    return this.currentUser;
  }

  setCurrentUser(user: DemoUserCredential) {
    this.currentUser = user;
    this.notify();
  }

  canManageBranch(branchId?: string): boolean {
    if (this.currentUser.branchScope === "all") return true;
    if (!branchId) return false;
    return this.currentUser.branchId === branchId;
  }

  canManageEmployee(employeeId?: string): boolean {
    if (this.currentUser.branchScope === "all") return true;
    if (!employeeId) return false;
    // Allow self for staff self-service check-in/out
    if (this.currentUser.employeeId === employeeId) return true;
    const emp = this.getEmployee(employeeId);
    if (!emp) return false;
    return this.canManageBranch(emp.branchId);
  }

  canManageLeave(leaveId?: string): boolean {
    if (this.currentUser.branchScope === "all") return true;
    if (!leaveId) return false;
    const req = this.leaveRequests.find((l) => l.id === leaveId);
    if (!req) return false;
    if (req.branchId) {
      return this.canManageBranch(req.branchId);
    }
    const emp = this.getEmployee(req.employeeId);
    return emp ? this.canManageBranch(emp.branchId) : false;
  }

  // --- Organization ---
  getCurrentOrg(): Organization {
    return (
      this.organizations.find((o) => o.id === this.currentOrgId) ||
      this.organizations[0]
    );
  }

  setCurrentOrg(orgId: string) {
    const org = this.organizations.find((o) => o.id === orgId);
    if (org) {
      this.currentOrgId = orgId;
      this.notify();
    }
  }

  updateCurrentOrg(updates: Partial<Organization>) {
    this.organizations = this.organizations.map((org) =>
      org.id === this.currentOrgId ? { ...org, ...updates } : org
    );
    this.notify();
  }

  // --- Employees ---
  getEmployees(): Employee[] {
    return this.employees;
  }

  getEmployee(id: string): Employee | undefined {
    return this.employees.find((e) => e.id === id);
  }

  createEmployee(input: CreateEmployeeInput): Employee {
    const assignedBranchId =
      this.currentUser.branchScope === "assigned_only" && this.currentUser.branchId
        ? this.currentUser.branchId
        : input.branchId;
    const assignedBranchName =
      this.currentUser.branchScope === "assigned_only" && this.currentUser.branchName
        ? this.currentUser.branchName
        : input.branchName;

    const newId = `emp-${Date.now().toString().slice(-4)}`;
    const newEmp: Employee = {
      ...input,
      id: newId,
      branchId: assignedBranchId,
      branchName: assignedBranchName,
      fullName: `${input.firstName} ${input.lastName}`.trim(),
    };
    this.employees = [newEmp, ...this.employees];
    // update branch employee count
    this.branches = this.branches.map((b) =>
      b.id === newEmp.branchId
        ? { ...b, employeeCount: b.employeeCount + 1 }
        : b
    );
    this.notify();
    return newEmp;
  }

  updateEmployee(id: string, input: UpdateEmployeeInput): Employee | undefined {
    if (!this.canManageEmployee(id)) {
      const emp = this.getEmployee(id);
      throw new Error(
        `Branch Permission Denied: As HR for ${this.currentUser.branchName || "your branch"}, you can only modify employees in your assigned branch. (${emp?.fullName} is in ${emp?.branchName}).`
      );
    }

    if (
      this.currentUser.branchScope === "assigned_only" &&
      input.branchId &&
      this.currentUser.branchId &&
      input.branchId !== this.currentUser.branchId
    ) {
      throw new Error(
        `Branch Permission Denied: As HR for ${this.currentUser.branchName || "your branch"}, you cannot reassign employees to a different branch.`
      );
    }

    let updatedEmp: Employee | undefined;
    this.employees = this.employees.map((emp) => {
      if (emp.id === id) {
        const next: Employee = {
          ...emp,
          ...input,
          fullName:
            input.firstName || input.lastName
              ? `${input.firstName ?? emp.firstName} ${
                  input.lastName ?? emp.lastName
                }`.trim()
              : emp.fullName,
        };
        updatedEmp = next;
        return next;
      }
      return emp;
    });
    this.notify();
    return updatedEmp;
  }

  deleteEmployee(id: string) {
    if (!this.canManageEmployee(id)) {
      const emp = this.getEmployee(id);
      throw new Error(
        `Branch Permission Denied: As HR for ${this.currentUser.branchName || "your branch"}, you cannot delete employee from ${emp?.branchName || "another branch"}.`
      );
    }

    this.employees = this.employees.filter((e) => e.id !== id);
    this.notify();
  }

  // --- Branches ---
  getBranches(): Branch[] {
    return this.branches;
  }

  createBranch(branch: Omit<Branch, "id" | "employeeCount">): Branch {
    const newBranch: Branch = {
      ...branch,
      id: `branch-${Date.now().toString().slice(-4)}`,
      employeeCount: 0,
    };
    this.branches = [...this.branches, newBranch];
    this.notify();
    return newBranch;
  }

  updateBranch(id: string, updates: Partial<Branch>): Branch | undefined {
    let updated: Branch | undefined;
    this.branches = this.branches.map((b) => {
      if (b.id === id) {
        updated = { ...b, ...updates };
        return updated;
      }
      return b;
    });
    this.notify();
    return updated;
  }

  // --- Attendance ---
  getAttendance(): AttendanceRecord[] {
    return this.attendance;
  }

  recordManualPunch(
    employeeId: string,
    type: "check_in" | "check_out"
  ): AttendanceRecord | undefined {
    if (!this.canManageEmployee(employeeId)) {
      const emp = this.getEmployee(employeeId);
      throw new Error(
        `Branch Permission Denied: As HR for ${this.currentUser.branchName || "your branch"}, you cannot punch attendance for ${emp?.fullName || "this employee"} (${emp?.branchName || "another branch"}).`
      );
    }

    const emp = this.getEmployee(employeeId);
    if (!emp) return undefined;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().slice(0, 5);

    const existing = this.attendance.find(
      (a) => a.employeeId === employeeId && a.date === today
    );

    if (existing) {
      this.attendance = this.attendance.map((a) => {
        if (a.id === existing.id) {
          return {
            ...a,
            checkOut: type === "check_out" ? now : a.checkOut,
            checkIn: type === "check_in" ? now : a.checkIn,
            status: "present",
          };
        }
        return a;
      });
    } else {
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now().toString().slice(-4)}`,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        departmentName: emp.departmentName,
        branchName: emp.branchName,
        branchId: emp.branchId,
        date: today,
        checkIn: now,
        checkOut: null,
        workedHours: 0,
        expectedHours: 8,
        status: "present",
      };
      this.attendance = [newRecord, ...this.attendance];
    }
    this.notify();
    return this.attendance.find((a) => a.employeeId === employeeId);
  }

  regularizeAttendance(
    employeeId: string,
    date: string,
    checkIn: string,
    checkOut: string,
    status: AttendanceRecord["status"],
    notes?: string
  ): AttendanceRecord {
    if (!this.canManageEmployee(employeeId)) {
      const emp = this.getEmployee(employeeId);
      throw new Error(
        `Branch Permission Denied: As HR for ${this.currentUser.branchName || "your branch"}, you can only regularize attendance for your assigned branch. (${emp?.fullName} is in ${emp?.branchName}).`
      );
    }

    const emp = this.getEmployee(employeeId);
    if (!emp) throw new Error("Employee not found");

    let workedHours = 8;
    if (checkIn && checkOut) {
      try {
        const [inH, inM] = checkIn.split(":").map(Number);
        const [outH, outM] = checkOut.split(":").map(Number);
        const diffM = outH * 60 + outM - (inH * 60 + inM);
        if (diffM > 0) {
          workedHours = Number((diffM / 60).toFixed(1));
        }
      } catch {
        workedHours = 8;
      }
    }

    const existingIndex = this.attendance.findIndex(
      (a) => a.employeeId === employeeId && a.date === date
    );

    let updatedRecord: AttendanceRecord;
    if (existingIndex >= 0) {
      updatedRecord = {
        ...this.attendance[existingIndex],
        checkIn,
        checkOut,
        workedHours,
        status,
        notes: notes || `Regularized by HR (${this.currentUser.name})`,
      };
      this.attendance = [
        ...this.attendance.slice(0, existingIndex),
        updatedRecord,
        ...this.attendance.slice(existingIndex + 1),
      ];
    } else {
      updatedRecord = {
        id: `att-${Date.now().toString().slice(-4)}`,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        departmentName: emp.departmentName,
        branchName: emp.branchName,
        branchId: emp.branchId,
        date,
        checkIn,
        checkOut,
        workedHours,
        expectedHours: 8,
        status,
        notes: notes || `Manual regularized by HR (${this.currentUser.name})`,
      };
      this.attendance = [updatedRecord, ...this.attendance];
    }
    this.notify();
    return updatedRecord;
  }

  // --- Shifts ---
  getShifts(): Shift[] {
    return this.shifts;
  }

  createShift(shift: Omit<Shift, "id" | "activeEmployeesCount">): Shift {
    const newShift: Shift = {
      ...shift,
      id: `shift-${Date.now().toString().slice(-4)}`,
      activeEmployeesCount: 0,
    };
    this.shifts = [...this.shifts, newShift];
    this.notify();
    return newShift;
  }

  updateShift(id: string, updates: Partial<Shift>): Shift | undefined {
    let updated: Shift | undefined;
    this.shifts = this.shifts.map((s) => {
      if (s.id === id) {
        updated = { ...s, ...updates };
        return updated;
      }
      return s;
    });
    this.notify();
    return updated;
  }

  // --- Devices ---
  getDevices(): BiometricDevice[] {
    return this.devices;
  }

  createDevice(
    device: Omit<BiometricDevice, "id" | "lastSyncAt" | "totalPunchesToday">
  ): BiometricDevice {
    const newDevice: BiometricDevice = {
      ...device,
      id: `dev-${Date.now().toString().slice(-4)}`,
      lastSyncAt: new Date().toISOString(),
      totalPunchesToday: 0,
    };
    this.devices = [...this.devices, newDevice];
    this.notify();
    return newDevice;
  }

  syncDevice(id: string) {
    this.devices = this.devices.map((d) =>
      d.id === id
        ? {
            ...d,
            status: "connected",
            lastSyncAt: new Date().toISOString(),
            totalPunchesToday: d.totalPunchesToday + 5,
          }
        : d
    );
    this.notify();
  }

  // --- Leave ---
  getLeaveRequests(): LeaveRequest[] {
    return this.leaveRequests;
  }

  createLeaveRequest(
    input: Omit<LeaveRequest, "id" | "appliedAt" | "status">
  ): LeaveRequest {
    // If not self and user is HR, check that employee belongs to their branch
    if (this.currentUser.employeeId !== input.employeeId && !this.canManageEmployee(input.employeeId)) {
      const emp = this.getEmployee(input.employeeId);
      throw new Error(
        `Branch Permission Denied: You cannot submit leave on behalf of ${emp?.fullName || "an employee"} in ${emp?.branchName || "another branch"}.`
      );
    }

    const newReq: LeaveRequest = {
      ...input,
      id: `lev-${Date.now().toString().slice(-4)}`,
      status: "pending",
      appliedAt: new Date().toISOString(),
    };
    this.leaveRequests = [newReq, ...this.leaveRequests];
    this.notify();
    return newReq;
  }

  updateLeaveStatus(
    id: string,
    status: LeaveStatus,
    reviewerName?: string,
    comments?: string
  ): LeaveRequest | undefined {
    if (!this.canManageLeave(id)) {
      const req = this.leaveRequests.find((l) => l.id === id);
      throw new Error(
        `Branch Permission Denied: As HR for ${this.currentUser.branchName || "your branch"}, you cannot approve or reject leave for ${req?.employeeName || "this employee"} (${req?.branchName || "another branch"}).`
      );
    }

    const finalReviewer = reviewerName || this.currentUser.name;
    let updated: LeaveRequest | undefined;
    this.leaveRequests = this.leaveRequests.map((req) => {
      if (req.id === id) {
        updated = {
          ...req,
          status,
          reviewedBy: finalReviewer,
          reviewedAt: new Date().toISOString(),
          comments: comments || req.comments,
        };
        return updated;
      }
      return req;
    });

    if (updated && status === "approved") {
      this.leaveBalances = this.leaveBalances.map((b) =>
        b.leaveType === updated!.leaveType
          ? {
              ...b,
              used: b.used + updated!.daysCount,
              pending: Math.max(0, b.pending - updated!.daysCount),
              remaining: Math.max(0, b.remaining - updated!.daysCount),
            }
          : b
      );
    }

    this.notify();
    return updated;
  }

  // --- Custom Fields ---
  getCustomFields(): CustomFieldDefinition[] {
    return this.customFields;
  }

  createCustomField(
    field: Omit<CustomFieldDefinition, "id">
  ): CustomFieldDefinition {
    const newField: CustomFieldDefinition = {
      ...field,
      id: `cf-${Date.now().toString().slice(-4)}`,
    };
    this.customFields = [...this.customFields, newField];
    this.notify();
    return newField;
  }

  updateCustomField(
    id: string,
    updates: Partial<CustomFieldDefinition>
  ): CustomFieldDefinition | undefined {
    let updated: CustomFieldDefinition | undefined;
    this.customFields = this.customFields.map((f) => {
      if (f.id === id) {
        updated = { ...f, ...updates };
        return updated;
      }
      return f;
    });
    this.notify();
    return updated;
  }

  toggleCustomField(id: string): CustomFieldDefinition | undefined {
    let updated: CustomFieldDefinition | undefined;
    this.customFields = this.customFields.map((f) => {
      if (f.id === id) {
        updated = { ...f, isActive: !f.isActive };
        return updated;
      }
      return f;
    });
    this.notify();
    return updated;
  }

  // --- Workflows ---
  getWorkflows(): WorkflowDefinition[] {
    return this.workflows;
  }

  saveWorkflow(workflow: WorkflowDefinition): WorkflowDefinition {
    const index = this.workflows.findIndex((w) => w.id === workflow.id);
    if (index >= 0) {
      this.workflows[index] = {
        ...workflow,
        updatedAt: new Date().toISOString(),
      };
    } else {
      this.workflows = [
        ...this.workflows,
        {
          ...workflow,
          id: workflow.id || `wf-${Date.now().toString().slice(-4)}`,
          updatedAt: new Date().toISOString(),
        },
      ];
    }
    this.notify();
    return workflow;
  }

  publishWorkflow(id: string): WorkflowDefinition | undefined {
    let updated: WorkflowDefinition | undefined;
    this.workflows = this.workflows.map((w) => {
      if (w.id === id) {
        updated = {
          ...w,
          status: "published",
          version: w.version + 1,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      return w;
    });
    this.notify();
    return updated;
  }

  // --- Modules ---
  getModules(): SaasModule[] {
    return this.modules;
  }

  toggleModule(key: string, enabled: boolean): SaasModule | undefined {
    let updated: SaasModule | undefined;
    this.modules = this.modules.map((m) => {
      if (m.key === key) {
        if (m.isCore && !enabled) {
          // core modules cannot be turned off
          return m;
        }
        updated = { ...m, isEnabled: enabled };
        return updated;
      }
      return m;
    });
    this.notify();
    return updated;
  }

  // --- Roles ---
  getRoles(): Role[] {
    return this.roles;
  }

  createRole(role: Omit<Role, "id" | "assignedMembersCount">): Role {
    const newRole: Role = {
      ...role,
      id: `role-${Date.now().toString().slice(-4)}`,
      assignedMembersCount: 0,
    };
    this.roles = [...this.roles, newRole];
    this.notify();
    return newRole;
  }

  updateRole(id: string, updates: Partial<Role>): Role | undefined {
    let updated: Role | undefined;
    this.roles = this.roles.map((r) => {
      if (r.id === id) {
        updated = { ...r, ...updates };
        return updated;
      }
      return r;
    });
    this.notify();
    return updated;
  }

  // --- Platform Admin ---
  toggleTenantStatus(tenantId: string): string | undefined {
    let nextStatus: string | undefined;
    this.platformAdmin.tenantsList = this.platformAdmin.tenantsList.map((t) => {
      if (t.id === tenantId) {
        nextStatus = t.status === "active" ? "suspended" : "active";
        return { ...t, status: nextStatus };
      }
      return t;
    });
    this.notify();
    return nextStatus;
  }
}

// Global store singleton
export const mockStore = new MockDataStore();

// React hook to subscribe to mockStore state changes
export function useMockStore<T>(selector: (store: MockDataStore) => T): T {
  const [val, setVal] = useState<T>(() => selector(mockStore));

  useEffect(() => {
    const unsubscribe = mockStore.subscribe(() => {
      setVal(selector(mockStore));
    });
    return () => unsubscribe();
  }, [selector]);

  return val;
}
