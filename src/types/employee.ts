import { EntityStatus } from "./common";

export interface Employee {
  id: string;
  organizationId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  departmentId: string;
  departmentName: string;
  branchId: string;
  branchName: string;
  designation: string;
  employmentType: "full-time" | "part-time" | "contract" | "intern";
  status: EntityStatus;
  joiningDate: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  emergencyContact?: string;
  workEmail?: string;
  customFields?: Record<string, string | number | boolean>;
}

export type CreateEmployeeInput = Omit<Employee, "id" | "fullName">;
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;
