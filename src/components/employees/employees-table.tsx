"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Employee } from "@/types/employee";
import { formatDate, getInitials } from "@/lib/format";
import { MoreHorizontal, Eye, Edit2, Trash2, Lock } from "lucide-react";
import { useMockStore, mockStore } from "@/lib/mock-api/store";

interface EmployeesTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeesTable({
  employees,
  onEdit,
  onDelete,
}: EmployeesTableProps) {
  const router = useRouter();
  const currentUser = useMockStore((s) => s.currentUser);

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[260px] text-xs font-semibold text-foreground">
                Employee
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Code
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Department
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Branch Location
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Designation
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Joined Date
              </TableHead>
              <TableHead className="w-[60px] text-right text-xs font-semibold text-foreground">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => {
              const canManage = mockStore.canManageBranch(emp.branchId);

              return (
                <TableRow
                  key={emp.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(emp.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="font-medium text-xs text-foreground hover:text-primary transition-colors truncate"
                        >
                          {emp.fullName}
                        </Link>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {emp.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {emp.employeeCode}
                  </TableCell>

                  <TableCell className="text-xs text-foreground font-medium">
                    {emp.departmentName}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{emp.branchName}</span>
                      {!canManage && (
                        <span
                          title={`Read-only: Stationed in ${emp.branchName}. Outside ${currentUser.branchName || "your branch"}.`}
                          className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] shrink-0 font-medium"
                        >
                          <Lock className="size-2.5" />
                          View Only
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-foreground">
                    {emp.designation}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={emp.status} />
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(emp.joiningDate)}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="size-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Employee actions"
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 p-1">
                        <DropdownMenuLabel className="text-[10px] text-muted-foreground px-2 py-1 uppercase tracking-wider">
                          Actions {canManage ? "" : "(Restricted)"}
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          className="text-xs cursor-pointer gap-2"
                          onClick={() => router.push(`/employees/${emp.id}`)}
                        >
                          <Eye className="size-3.5 text-muted-foreground" />
                          View Profile
                        </DropdownMenuItem>

                        {canManage ? (
                          <>
                            <DropdownMenuItem
                              className="text-xs cursor-pointer gap-2"
                              onClick={() => onEdit(emp)}
                            >
                              <Edit2 className="size-3.5 text-muted-foreground" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-xs cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 gap-2"
                              onClick={() => onDelete(emp)}
                            >
                              <Trash2 className="size-3.5" />
                              Deactivate
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              disabled
                              className="text-xs opacity-50 cursor-not-allowed gap-2 text-muted-foreground"
                            >
                              <Lock className="size-3.5 text-muted-foreground" />
                              Edit (Branch Locked)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled
                              className="text-xs opacity-50 cursor-not-allowed gap-2 text-muted-foreground"
                            >
                              <Lock className="size-3.5 text-muted-foreground" />
                              Deactivate (Branch Locked)
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
