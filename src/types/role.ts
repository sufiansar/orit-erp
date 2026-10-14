export type PermissionAction = "view" | "create" | "edit" | "delete" | "export";

export interface ModulePermission {
  moduleKey: string;
  moduleName: string;
  actions: Record<PermissionAction, boolean>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean; // system roles cannot be deleted
  branchScope: "all" | "assigned_only";
  allowedBranchIds?: string[];
  assignedMembersCount: number;
  permissions: ModulePermission[];
}

export interface RoleMember {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  department: string;
  branch: string;
  avatarUrl?: string;
}
