"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee } from "@/types/employee";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess?: (emp: Employee) => void;
}

export function EmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Edit Employee Profile" : "Onboard New Employee"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {employee
              ? "Update personnel information and department assignment."
              : "Register a new staff member into the current tenant organization."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <EmployeeFormContent
            key={employee ? employee.id : "new-employee"}
            employee={employee}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EmployeeFormContent({
  employee,
  onClose,
  onSuccess,
}: {
  employee?: Employee | null;
  onClose: () => void;
  onSuccess?: (emp: Employee) => void;
}) {
  const branches = useMockStore((s) => s.branches);
  const departments = useMockStore((s) => s.departments);
  const currentOrg = useMockStore((s) => s.getCurrentOrg());
  const currentUser = useMockStore((s) => s.currentUser);
  const isBranchRestricted =
    currentUser.branchScope === "assigned_only" && Boolean(currentUser.branchId);
  const customFields = useMockStore((s) =>
    s.customFields.filter((cf) => cf.entityType === "employee" && cf.isActive)
  );

  const [formData, setFormData] = useState(() => {
    if (employee) {
      return {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        employeeCode: employee.employeeCode,
        departmentId: employee.departmentId,
        branchId: employee.branchId,
        designation: employee.designation,
        employmentType: employee.employmentType,
        status: employee.status,
        joiningDate: employee.joiningDate,
        customFields: { ...(employee.customFields || {}) },
      };
    }
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      departmentId: departments[0]?.id || "",
      branchId:
        isBranchRestricted && currentUser.branchId
          ? currentUser.branchId
          : branches[0]?.id || "",
      designation: "",
      employmentType: "full-time" as Employee["employmentType"],
      status: "active" as Employee["status"],
      joiningDate: new Date().toISOString().split("T")[0],
      customFields: {} as Record<string, string | number | boolean>,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    if (!formData.email.trim() || !formData.email.includes("@"))
      errs.email = "Valid corporate email is required";
    if (!formData.designation.trim())
      errs.designation = "Job title / designation is required";
    if (!formData.branchId) errs.branchId = "Branch assignment is required";
    if (!formData.departmentId)
      errs.departmentId = "Department assignment is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    const selectedBranch = branches.find((b) => b.id === formData.branchId);
    const selectedDept = departments.find((d) => d.id === formData.departmentId);

    if (employee) {
      const updated = mockStore.updateEmployee(employee.id, {
        ...formData,
        branchName: selectedBranch?.name || "",
        departmentName: selectedDept?.name || "",
      });
      setSubmitting(false);
      onClose();
      toast.success(`Updated details for ${formData.firstName} ${formData.lastName}`);
      if (updated && onSuccess) onSuccess(updated);
    } else {
      const created = mockStore.createEmployee({
        ...formData,
        organizationId: currentOrg.id,
        branchName: selectedBranch?.name || "",
        departmentName: selectedDept?.name || "",
      });
      setSubmitting(false);
      onClose();
      toast.success(
        `Employee ${created.fullName} onboarded successfully! (EMP Code: ${created.employeeCode})`
      );
      if (onSuccess) onSuccess(created);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-xs">
            First Name *
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            placeholder="David"
            className="h-8 text-xs"
          />
          {errors.firstName && (
            <p className="text-[10px] text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-xs">
            Last Name *
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            placeholder="Chen"
            className="h-8 text-xs"
          />
          {errors.lastName && (
            <p className="text-[10px] text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs">
            Work Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="david.chen@acmeglobal.io"
            className="h-8 text-xs"
          />
          {errors.email && (
            <p className="text-[10px] text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs">
            Phone Number
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+65 9123 4567"
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="employeeCode" className="text-xs">
            Employee Code
          </Label>
          <Input
            id="employeeCode"
            value={formData.employeeCode}
            onChange={(e) =>
              setFormData({ ...formData, employeeCode: e.target.value })
            }
            placeholder="EMP-1001"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="designation" className="text-xs">
            Designation / Title *
          </Label>
          <Input
            id="designation"
            value={formData.designation}
            onChange={(e) =>
              setFormData({ ...formData, designation: e.target.value })
            }
            placeholder="Senior Engineer"
            className="h-8 text-xs"
          />
          {errors.designation && (
            <p className="text-[10px] text-destructive">{errors.designation}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Assigned Branch *</Label>
            {isBranchRestricted && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                HR Scoped
              </span>
            )}
          </div>
          <Select
            value={formData.branchId}
            disabled={isBranchRestricted}
            onValueChange={(val) =>
              setFormData({ ...formData, branchId: val || "" })
            }
          >
            <SelectTrigger className="h-8 text-xs disabled:opacity-85 disabled:bg-muted/50">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches
                .filter((b) => !isBranchRestricted || b.id === currentUser.branchId)
                .map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-xs">
                    {b.name} ({b.code})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {isBranchRestricted && (
            <p className="text-[10px] text-muted-foreground">
              Stationed at {currentUser.branchName || "your assigned branch"}.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Department *</Label>
          <Select
            value={formData.departmentId}
            onValueChange={(val) =>
              setFormData({ ...formData, departmentId: val || "" })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id} className="text-xs">
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Employment Type</Label>
          <Select
            value={formData.employmentType}
            onValueChange={(val) =>
              setFormData({
                ...formData,
                employmentType: (val as typeof formData.employmentType) || "full-time",
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time" className="text-xs">Full-Time</SelectItem>
              <SelectItem value="part-time" className="text-xs">Part-Time</SelectItem>
              <SelectItem value="contract" className="text-xs">Contract</SelectItem>
              <SelectItem value="intern" className="text-xs">Intern</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(val) =>
              setFormData({
                ...formData,
                status: (val as typeof formData.status) || "active",
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active" className="text-xs">Active</SelectItem>
              <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
              <SelectItem value="pending" className="text-xs">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="joiningDate" className="text-xs">Joining Date</Label>
          <Input
            id="joiningDate"
            type="date"
            value={formData.joiningDate}
            onChange={(e) =>
              setFormData({ ...formData, joiningDate: e.target.value })
            }
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Dynamic Custom Fields Section */}
      {customFields.length > 0 && (
        <div className="pt-3 border-t border-border/60 space-y-3">
          <h4 className="text-xs font-semibold text-foreground">
            Organization Custom Profile Fields
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {customFields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label htmlFor={field.fieldKey} className="text-xs">
                  {field.label} {field.required && "*"}
                </Label>
                {field.fieldType === "select" ? (
                  <Select
                    value={String(formData.customFields[field.fieldKey] || "")}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        customFields: {
                          ...formData.customFields,
                          [field.fieldKey]: v || "",
                        },
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-xs">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.fieldKey}
                    value={String(formData.customFields[field.fieldKey] || "")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customFields: {
                          ...formData.customFields,
                          [field.fieldKey]: e.target.value,
                        },
                      })
                    }
                    placeholder={field.placeholder || `Enter ${field.label}`}
                    className="h-8 text-xs"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <DialogFooter className="pt-3 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={submitting}
          className="text-xs gap-1.5"
        >
          {submitting && <Loader2 className="size-3.5 animate-spin" />}
          {employee ? "Save Changes" : "Create Employee"}
        </Button>
      </DialogFooter>
    </form>
  );
}
