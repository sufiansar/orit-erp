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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaveType, LeaveRequest } from "@/types/leave";
import { mockStore, useMockStore } from "@/lib/mock-api/store";
import { toast } from "sonner";
import { Calendar, User, FileText, Send } from "lucide-react";

interface LeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (req: LeaveRequest) => void;
}

export function LeaveRequestDialog({
  open,
  onOpenChange,
  onSuccess,
}: LeaveRequestDialogProps) {
  const currentUser = useMockStore((s) => s.currentUser);
  const employees = useMockStore((s) => s.employees);

  // Available employees to pick:
  // If HR, only employees in their branch; if employee, only self; if org admin, all
  const eligibleEmployees = React.useMemo(() => {
    if (currentUser.roleType === "employee") {
      return employees.filter((e) => e.email === currentUser.email);
    }
    if (currentUser.branchScope === "assigned_only" && currentUser.branchId) {
      return employees.filter((e) => e.branchId === currentUser.branchId);
    }
    return employees;
  }, [currentUser, employees]);

  const defaultEmpId =
    currentUser.employeeId ||
    eligibleEmployees.find((e) => e.email === currentUser.email)?.id ||
    eligibleEmployees[0]?.id ||
    "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        {open && (
          <LeaveRequestForm
            key={defaultEmpId}
            eligibleEmployees={eligibleEmployees}
            defaultEmpId={defaultEmpId}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface FormProps {
  eligibleEmployees: ReturnType<typeof useMockStore>["employees"];
  defaultEmpId: string;
  onClose: () => void;
  onSuccess?: (req: LeaveRequest) => void;
}

function LeaveRequestForm({
  eligibleEmployees,
  defaultEmpId,
  onClose,
  onSuccess,
}: FormProps) {
  const [employeeId, setEmployeeId] = useState(defaultEmpId);
  const [leaveType, setLeaveType] = useState<LeaveType>("casual");
  const [startDate, setStartDate] = useState("2026-10-22");
  const [endDate, setEndDate] = useState("2026-10-23");
  const [daysCount, setDaysCount] = useState(2);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Recompute days when start/end changes
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = Math.abs(e.getTime() - s.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDaysCount(isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays);
    } catch {
      setDaysCount(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for the leave application.");
      return;
    }

    const emp = eligibleEmployees.find((e) => e.id === employeeId);
    if (!emp) {
      toast.error("Please select a valid employee.");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));

    try {
      const newReq = mockStore.createLeaveRequest({
        employeeId: emp.id,
        employeeName: emp.fullName,
        employeeCode: emp.employeeCode,
        departmentName: emp.departmentName,
        branchName: emp.branchName,
        branchId: emp.branchId,
        leaveType,
        startDate,
        endDate,
        daysCount,
        reason,
      });

      toast.success("Leave application submitted successfully!", {
        description: `${emp.fullName} • ${daysCount} day(s) of ${leaveType.toUpperCase()} leave.`,
      });

      onSuccess?.(newReq);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to apply for leave";
      toast.error("Application Failed", { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          <span>Submit Leave Application</span>
        </DialogTitle>
        <DialogDescription className="text-xs">
          Apply for paid time off, medical absence, or casual leave.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-1.5">
        <Label htmlFor="leave-emp" className="text-xs">
          Employee Applicant *
        </Label>
        <Select value={employeeId} onValueChange={(v) => setEmployeeId(v || "")}>
          <SelectTrigger id="leave-emp" className="h-8 text-xs">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {eligibleEmployees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id} className="text-xs">
                {emp.fullName} ({emp.employeeCode} - {emp.branchName.split(" ")[0]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="leave-type" className="text-xs">
          Leave Category *
        </Label>
        <Select
          value={leaveType}
          onValueChange={(v) => setLeaveType(v as LeaveType)}
        >
          <SelectTrigger id="leave-type" className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="casual" className="text-xs">Casual Leave (CL)</SelectItem>
            <SelectItem value="sick" className="text-xs">Sick Leave (SL)</SelectItem>
            <SelectItem value="annual" className="text-xs">Annual Vacation Leave (AL)</SelectItem>
            <SelectItem value="maternity" className="text-xs">Maternity Leave</SelectItem>
            <SelectItem value="paternity" className="text-xs">Paternity Leave</SelectItem>
            <SelectItem value="unpaid" className="text-xs">Leave Without Pay (LWP)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="start-date" className="text-xs">
            Start Date *
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange(e.target.value, endDate)}
            required
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="end-date" className="text-xs">
            End Date *
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange(startDate, e.target.value)}
            required
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="rounded-lg bg-muted/40 p-2.5 text-xs flex items-center justify-between border border-border/60">
        <span className="text-muted-foreground">Total Working Days Requested:</span>
        <span className="font-bold text-foreground font-mono">
          {daysCount} {daysCount === 1 ? "day" : "days"}
        </span>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="leave-reason" className="text-xs">
          Reason for Absence *
        </Label>
        <Textarea
          id="leave-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Detailed explanation of the requested time off..."
          required
          rows={3}
          className="text-xs"
        />
      </div>

      <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
          className="text-xs font-semibold gap-1.5"
        >
          <Send className="size-3.5" />
          {submitting ? "Submitting..." : "Submit Application"}
        </Button>
      </DialogFooter>
    </form>
  );
}
