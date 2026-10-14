"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { FilterBar } from "@/components/shared/filter-bar";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { AttendanceCalendarView } from "@/components/attendance/attendance-calendar-view";
import { DevicePanel } from "@/components/attendance/device-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { generateAttendanceCsv } from "@/lib/mock-api";
import { formatDate } from "@/lib/format";
import { AttendanceRegularizeDialog } from "@/components/attendance/attendance-regularize-dialog";
import { Employee } from "@/types/employee";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import {
  Download,
  CalendarCheck,
  UserCheck,
  AlertTriangle,
  Clock,
  CalendarDays,
  Fingerprint,
  CalendarOff,
  Edit3,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export default function AttendancePage() {
  const attendance = useMockStore((s) => s.attendance);
  const branches = useMockStore((s) => s.branches);
  const departments = useMockStore((s) => s.departments);
  const employees = useMockStore((s) => s.employees);
  const currentUser = useMockStore((s) => s.currentUser);

  // Attendance Regularize Dialog State
  const [regularizeTarget, setRegularizeTarget] = useState<{
    open: boolean;
    employee: Employee | null;
    date?: string;
    checkIn?: string;
    checkOut?: string;
    status?: AttendanceStatus;
  }>({
    open: false,
    employee: null,
  });

  const handleOpenRegularize = (rec: AttendanceRecord) => {
    const emp = employees.find((e) => e.id === rec.employeeId);
    if (!emp) {
      toast.error("Employee profile not found");
      return;
    }
    setRegularizeTarget({
      open: true,
      employee: emp,
      date: rec.date,
      checkIn: rec.checkIn || "09:00",
      checkOut: rec.checkOut || "18:00",
      status: rec.status,
    });
  };

  // Filter States for Organization Log
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-10-14");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered dataset
  const filteredAttendance = useMemo(() => {
    return attendance.filter((rec) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          rec.employeeName.toLowerCase().includes(q) ||
          rec.employeeCode.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedDate && rec.date !== selectedDate) {
        return false;
      }

      if (selectedBranch !== "all" && rec.branchId !== selectedBranch) {
        return false;
      }

      if (selectedDept !== "all" && rec.departmentName !== selectedDept) {
        return false;
      }

      if (selectedStatus !== "all" && rec.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [attendance, search, selectedDate, selectedBranch, selectedDept, selectedStatus]);

  // Paginated dataset
  const totalItems = filteredAttendance.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAttendance.slice(start, start + pageSize);
  }, [filteredAttendance, currentPage, pageSize]);

  // Export real CSV
  const handleExportCsv = () => {
    try {
      const csvString = generateAttendanceCsv(filteredAttendance);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `OrbitERP_Attendance_${selectedDate || "All"}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Attendance CSV report exported successfully!", {
        description: `Exported ${filteredAttendance.length} records.`,
      });
    } catch {
      toast.error("Failed to generate CSV file.");
    }
  };

  // Quick stats
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const lateCount = attendance.filter((a) => a.status === "late").length;
  const earlyCount = attendance.filter((a) => a.status === "early_exit").length;
  const absentCount = attendance.filter(
    (a) => a.status === "absent" || a.status === "on_leave"
  ).length;

  if (currentUser.roleType === "employee") {
    return (
      <PageContainer maxWidth="full" className="py-6 space-y-6">
        <AttendanceCalendarView />
      </PageContainer>
    );
  }

  return (
    <>
      <PageHeader
        title="Time & Attendance"
        description="Daily biometric punches, employee calendar schedules, grace periods, and hardware synchronization."
        breadcrumbs={[{ label: "Time & Attendance" }, { label: "Attendance" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5 text-xs font-semibold"
          >
            <Download className="size-3.5" />
            Export CSV Report
          </Button>
        }
      />

      <PageContainer maxWidth="full">
        {/* Navigation Tabs */}
        <Tabs defaultValue="register" className="space-y-6">
          <TabsList className="h-10 p-1 bg-muted/60 border border-border/80">
            <TabsTrigger value="register" className="text-xs font-semibold gap-2">
              <CalendarCheck className="size-3.5" />
              Organization Register
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs font-semibold gap-2">
              <CalendarDays className="size-3.5" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="devices" className="text-xs font-semibold gap-2">
              <Fingerprint className="size-3.5" />
              Biometric Hardware Terminals
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: User-Requested PeopleDesk Calendar View */}
          <TabsContent value="calendar" className="space-y-6 focus-visible:outline-none">
            <AttendanceCalendarView />
          </TabsContent>

          {/* TAB 2: Organization Attendance Register */}
          <TabsContent value="register" className="space-y-6 focus-visible:outline-none">
            {/* Branch Scope HR Notice */}
            {currentUser.branchScope === "assigned_only" && (
              <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/10 p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="font-bold">Branch HR Administrative Scope: </span>
                    <span>
                      You are logged in as <strong>{currentUser.name}</strong> ({currentUser.branchName}). You can regularize attendance only for {currentUser.branchName} employees. Records from other branches are locked.
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-background text-amber-700 dark:text-amber-300 border-amber-300 shrink-0 font-medium">
                  Singapore HQ Scoped
                </Badge>
              </div>
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Present Today"
                value={presentCount}
                icon={UserCheck}
                trend="up"
                change="On schedule"
              />
              <StatCard
                title="Late Arrivals"
                value={lateCount}
                icon={Clock}
                trend="down"
                change="Grace period exceeded"
              />
              <StatCard
                title="Early Departures"
                value={earlyCount}
                icon={AlertTriangle}
                trend="neutral"
                change="Permission approved"
              />
              <StatCard
                title="Absent / Leave"
                value={absentCount}
                icon={CalendarOff}
                trend="neutral"
                change="Approved absence"
              />
            </div>

            {/* Filter Bar */}
            <FilterBar>
              <div className="flex flex-1 flex-wrap items-center gap-2.5">
                <SearchInput
                  value={search}
                  onChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter employee or code..."
                  className="w-full sm:w-60"
                />

                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 w-40 text-xs"
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
                      <SelectItem key={d.id} value={d.name} className="text-xs">
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
                    <SelectItem value="present" className="text-xs">Present</SelectItem>
                    <SelectItem value="late" className="text-xs">Late</SelectItem>
                    <SelectItem value="early_exit" className="text-xs">Early Exit</SelectItem>
                    <SelectItem value="absent" className="text-xs">Absent</SelectItem>
                    <SelectItem value="on_leave" className="text-xs">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-muted-foreground shrink-0">
                Entries: <strong className="text-foreground">{filteredAttendance.length}</strong>
              </div>
            </FilterBar>

            {/* Attendance Register Table */}
            {filteredAttendance.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="No attendance records found"
                description="No daily punches match the selected filters or date."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setSelectedDate("");
                      setSelectedBranch("all");
                      setSelectedDept("all");
                      setSelectedStatus("all");
                    }}
                    className="text-xs"
                  >
                    Reset filters
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="text-xs font-semibold text-foreground">Date</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Employee</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Code</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Department</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Branch</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Check In</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Check Out</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Worked</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">Terminal / Notes</TableHead>
                          <TableHead className="text-xs font-semibold text-foreground text-right pr-4">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRecords.map((rec) => {
                          const isBranchAllowed = mockStore.canManageBranch(rec.branchId);
                          return (
                            <TableRow key={rec.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="text-xs text-muted-foreground font-medium">
                                {formatDate(rec.date)}
                              </TableCell>
                              <TableCell className="text-xs font-bold text-foreground">
                                {rec.employeeName}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-muted-foreground">
                                {rec.employeeCode}
                              </TableCell>
                              <TableCell className="text-xs text-foreground font-medium">
                                {rec.departmentName}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {rec.branchName}
                              </TableCell>
                              <TableCell className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400">
                                {rec.checkIn || "—"}
                              </TableCell>
                              <TableCell className="text-xs font-mono font-medium text-amber-700 dark:text-amber-400">
                                {rec.checkOut || "Active"}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-foreground font-medium">
                                {rec.workedHours > 0 ? `${rec.workedHours} hrs` : "0 hrs"}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={rec.status} />
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {rec.deviceName || rec.notes || "ZKTeco ProFace"}
                              </TableCell>
                              <TableCell className="text-right pr-4">
                                {isBranchAllowed ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenRegularize(rec)}
                                    className="h-7 text-xs px-2.5 gap-1.5 text-primary hover:bg-primary/10 border-primary/30"
                                  >
                                    <Edit3 className="size-3" />
                                    Regularize
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled
                                    className="h-7 text-[11px] px-2 gap-1 text-muted-foreground/60 cursor-not-allowed"
                                    title={`Branch Restricted: ${rec.branchName} is outside your branch authority.`}
                                  >
                                    <Lock className="size-3" />
                                    Locked
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </TabsContent>

          {/* TAB 3: Biometric Hardware Terminals */}
          <TabsContent value="devices" className="space-y-6 focus-visible:outline-none">
            <DevicePanel />
          </TabsContent>
        </Tabs>

        {/* Attendance Regularize Dialog */}
        <AttendanceRegularizeDialog
          open={regularizeTarget.open}
          onOpenChange={(open) =>
            setRegularizeTarget((prev) => ({ ...prev, open }))
          }
          employee={regularizeTarget.employee}
          initialDate={regularizeTarget.date}
          initialStatus={regularizeTarget.status}
          initialCheckIn={regularizeTarget.checkIn}
          initialCheckOut={regularizeTarget.checkOut}
        />
      </PageContainer>
    </>
  );
}
