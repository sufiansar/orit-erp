export type LeaveType = "annual" | "sick" | "casual" | "maternity" | "paternity" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  branchName: string;
  branchId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export interface LeaveBalance {
  leaveType: LeaveType;
  title: string;
  totalAllowance: number;
  used: number;
  pending: number;
  remaining: number;
}
