"use client";

import * as React from "react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { Role, RoleMember, PermissionAction } from "@/types/role";
import {
  ShieldAlert,
  ShieldCheck,
  PlusCircle,
  Users,
  Check,
  X,
  Lock,
  Building,
  KeyRound,
  Edit2,
  Crown,
} from "lucide-react";
import { toast } from "sonner";

export default function RolesPage() {
  const roles = useMockStore((s) => s.roles);
  const roleMembers = useMockStore((s) => s.roleMembers);
  const currentUser = useMockStore((s) => s.currentUser);

  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[1]?.id || roles[0]?.id);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];
  const membersOfSelectedRole = roleMembers.filter((m) => m.roleId === selectedRole.id);

  const handleTogglePermission = (
    moduleKey: string,
    action: PermissionAction
  ) => {
    if (selectedRole.isSystemRole) {
      toast.info("System Role Protected", {
        description: `Permissions for ${selectedRole.name} are managed by system security policy.`,
      });
      return;
    }

    mockStore.roles = mockStore.roles.map((r) => {
      if (r.id === selectedRole.id) {
        return {
          ...r,
          permissions: r.permissions.map((p) => {
            if (p.moduleKey === moduleKey) {
              return {
                ...p,
                actions: {
                  ...p.actions,
                  [action]: !p.actions[action],
                },
              };
            }
            return p;
          }),
        };
      }
      return r;
    });
    mockStore.notify();
    toast.success("Permission policy updated");
  };

  return (
    <>
      <PageHeader
        title="Roles & Security Permissions"
        description="Role-Based Access Control (RBAC), multi-tier permission matrix, and branch data isolation scopes."
        breadcrumbs={[{ label: "Administration" }, { label: "Roles & Permissions" }]}
      />

      <PageContainer maxWidth="full">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <StatCard
            title="Configured Roles"
            value={roles.length}
            icon={KeyRound}
            trend="neutral"
            change="System & custom definitions"
          />
          <StatCard
            title="Assigned Personnel"
            value={roleMembers.length}
            icon={Users}
            trend="up"
            change="Mapped to tenant users"
          />
          <StatCard
            title="Branch Scoping Enforced"
            value="Active"
            icon={Building}
            trend="neutral"
            change="Branch HR limited to local site"
          />
        </div>

        {/* Roles Master-Detail Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Role Selector Cards */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                System & Custom Roles
              </h3>
            </div>

            <div className="space-y-2">
              {roles.map((r) => {
                const isSelected = r.id === selectedRole.id;
                return (
                  <Card
                    key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`cursor-pointer transition-all border ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border/80 bg-card hover:bg-muted/40"
                    }`}
                  >
                    <CardHeader className="p-3.5 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                          {r.id.includes("admin") ? (
                            <Crown className="size-3.5 text-primary" />
                          ) : (
                            <ShieldCheck className="size-3.5 text-muted-foreground" />
                          )}
                          <span>{r.name}</span>
                        </div>
                        {r.branchScope === "assigned_only" ? (
                          <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 border-amber-300">
                            Branch Scoped
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 border-indigo-300">
                            All Branches
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3.5 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {r.description}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-medium">
                        <span>{r.assignedMembersCount} Assigned Staff</span>
                        <span>{r.isSystemRole ? "System Default" : "Custom"}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Column: Permission Matrix & Role Members */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="p-4 pb-3 border-b border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold text-foreground">
                        {selectedRole.name}
                      </CardTitle>
                      {selectedRole.branchScope === "assigned_only" && (
                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300">
                          Branch Scoped: Elena Rostova (Singapore HQ)
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedRole.description}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Data Authority Scope:{" "}
                    <strong className="text-foreground">
                      {selectedRole.branchScope === "all"
                        ? "Global (All Company Branches)"
                        : "Strictly Assigned Branch Personnel"}
                    </strong>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Permission Matrix Table */}
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-foreground">Module</TableHead>
                      <TableHead className="text-xs font-semibold text-center text-foreground">View</TableHead>
                      <TableHead className="text-xs font-semibold text-center text-foreground">Create</TableHead>
                      <TableHead className="text-xs font-semibold text-center text-foreground">Edit</TableHead>
                      <TableHead className="text-xs font-semibold text-center text-foreground">Delete</TableHead>
                      <TableHead className="text-xs font-semibold text-center text-foreground">Export</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRole.permissions.map((perm) => (
                      <TableRow key={perm.moduleKey} className="hover:bg-muted/20">
                        <TableCell className="text-xs font-semibold text-foreground">
                          {perm.moduleName}
                        </TableCell>

                        {(["view", "create", "edit", "delete", "export"] as PermissionAction[]).map(
                          (act) => {
                            const isAllowed = perm.actions[act];
                            return (
                              <TableCell key={act} className="text-center py-2.5">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(perm.moduleKey, act)}
                                  className={`size-6 rounded-md inline-flex items-center justify-center transition-colors ${
                                    isAllowed
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                      : "bg-muted text-muted-foreground/40 hover:bg-muted/80"
                                  }`}
                                >
                                  {isAllowed ? (
                                    <Check className="size-3.5 stroke-[3]" />
                                  ) : (
                                    <X className="size-3.5" />
                                  )}
                                </button>
                              </TableCell>
                            );
                          }
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Assigned Role Members Card */}
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="p-4 pb-2 border-b border-border/60">
                <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Assigned Personnel ({membersOfSelectedRole.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {membersOfSelectedRole.map((member) => (
                    <div
                      key={member.id}
                      className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground">{member.name}</p>
                        <p className="text-[11px] text-muted-foreground">{member.email}</p>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        {member.branch}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
