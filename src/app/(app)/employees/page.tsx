"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { FilterBar } from "@/components/shared/filter-bar";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmployeesTable } from "@/components/employees/employees-table";
import { EmployeeDialog } from "@/components/employees/employee-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { Employee } from "@/types/employee";
import { UserPlus, Users, RotateCcw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function EmployeesPage() {
  const searchParams = useSearchParams();
  const initialNew = searchParams.get("action") === "new";

  const employees = useMockStore((s) => s.employees);
  const branches = useMockStore((s) => s.branches);
  const departments = useMockStore((s) => s.departments);
  const currentUser = useMockStore((s) => s.currentUser);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(initialNew);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Filtered dataset
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          emp.fullName.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.employeeCode.toLowerCase().includes(q) ||
          emp.designation.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedBranch !== "all" && emp.branchId !== selectedBranch) {
        return false;
      }

      if (selectedDept !== "all" && emp.departmentId !== selectedDept) {
        return false;
      }

      if (selectedStatus !== "all" && emp.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [employees, search, selectedBranch, selectedDept, selectedStatus]);

  // Paginated dataset
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedBranch("all");
    setSelectedDept("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const handleEdit = (emp: Employee) => {
    if (!mockStore.canManageBranch(emp.branchId)) {
      toast.error("Branch Permission Denied", {
        description: `As HR for ${currentUser.branchName || "your branch"}, you cannot edit employees stationed in ${emp.branchName}.`,
      });
      return;
    }
    setEditingEmployee(emp);
    setDialogOpen(true);
  };

  const handleDeletePrompt = (emp: Employee) => {
    if (!mockStore.canManageBranch(emp.branchId)) {
      toast.error("Branch Permission Denied", {
        description: `As HR for ${currentUser.branchName || "your branch"}, you cannot deactivate employees stationed in ${emp.branchName}.`,
      });
      return;
    }
    setEmployeeToDelete(emp);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      try {
        mockStore.deleteEmployee(employeeToDelete.id);
        toast.success(
          `Employee ${employeeToDelete.fullName} (${employeeToDelete.employeeCode}) was deactivated from the directory.`
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete employee";
        toast.error("Action Denied", { description: msg });
      } finally {
        setEmployeeToDelete(null);
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Employees Directory"
        description="Search, manage and onboard personnel across your global branches and functional teams."
        breadcrumbs={[{ label: "People" }, { label: "Employees" }]}
        actions={
          <Button
            onClick={() => {
              setEditingEmployee(null);
              setDialogOpen(true);
            }}
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <UserPlus className="size-3.5" />
            Add Employee
          </Button>
        }
      />

      <PageContainer maxWidth="full">
        {/* Branch Scope HR Notice */}
        {currentUser.branchScope === "assigned_only" && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/10 p-3.5 mb-4 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold">Branch HR Administrative Scope: </span>
                <span>
                  You are active as <strong>{currentUser.name}</strong> ({currentUser.branchName}). You can edit details and manage personnel only within {currentUser.branchName}. Other branch staff are view-only.
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] bg-background text-amber-700 dark:text-amber-300 border-amber-300 shrink-0 font-medium">
              Singapore HQ Scoped
            </Badge>
          </div>
        )}

        {/* Filters Toolbar */}
        <FilterBar>
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, code or title..."
              className="w-full sm:w-72"
            />

            <Select
              value={selectedBranch}
              onValueChange={(v) => {
                setSelectedBranch(v || "all");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-40 text-xs">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-xs">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDept}
              onValueChange={(v) => {
                setSelectedDept(v || "all");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-44 text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id} className="text-xs">
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedStatus}
              onValueChange={(v) => {
                setSelectedStatus(v || "all");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-32 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Status</SelectItem>
                <SelectItem value="active" className="text-xs">Active</SelectItem>
                <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                <SelectItem value="pending" className="text-xs">Pending</SelectItem>
              </SelectContent>
            </Select>

            {(search || selectedBranch !== "all" || selectedDept !== "all" || selectedStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="size-3" />
                Reset
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground self-center shrink-0">
            Total Staff: <strong className="text-foreground">{employees.length}</strong>
          </div>
        </FilterBar>

        {/* Table or Empty State */}
        {filteredEmployees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description={
              search || selectedBranch !== "all"
                ? "No personnel match the selected search criteria. Try clearing filters."
                : "No employees registered yet in this organization workspace."
            }
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                Clear all filters
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            <EmployeesTable
              employees={paginatedEmployees}
              onEdit={handleEdit}
              onDelete={handleDeletePrompt}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </PageContainer>

      {/* Add / Edit Dialog */}
      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editingEmployee}
      />

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Deactivate Staff Member?"
        description={`Are you sure you want to deactivate ${employeeToDelete?.fullName} (${employeeToDelete?.employeeCode})? Their access to biometric attendance and shift assignment will be revoked in demo state.`}
        confirmLabel="Deactivate Employee"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
