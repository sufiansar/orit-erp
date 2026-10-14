export type WorkflowTrigger =
  | "leave_submitted"
  | "expense_submitted"
  | "purchase_request_submitted"
  | "shift_swap_requested";

export type ApproverType =
  | "direct_manager"
  | "department_head"
  | "hr_manager"
  | "org_admin"
  | "specific_role";

export interface WorkflowStep {
  id: string;
  order: number;
  name: string;
  approverType: ApproverType;
  roleId?: string;
  timeLimitHours: number;
  autoApproveOnTimeout: boolean;
  requiredApprovalAction: "any" | "all";
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  status: "draft" | "published" | "archived";
  steps: WorkflowStep[];
  updatedAt: string;
  version: number;
}
