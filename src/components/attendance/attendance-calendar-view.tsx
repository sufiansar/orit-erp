"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { toast } from "sonner";
import {
  Clock,
  CalendarDays,
  ArrowUp,
  ArrowDown,
  Building,
  CheckCircle2,
  Lock,
  Edit3,
  User,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AttendanceRegularizeDialog } from "./attendance-regularize-dialog";

interface AttendanceCalendarViewProps {
  employeeId?: string; // If provided, shows for specific employee; otherwise current user
}

type DayStatus = "Present" | "Late" | "Absent" | "Offday" | "Holiday" | "Leave";

interface CalendarDayData {
  dayNumber: number;
  dateStr: string;
  status: DayStatus;
  checkIn?: string;
  checkOut?: string;
  duration?: string;
  isToday?: boolean;
}

const MONTH_NAMES = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function AttendanceCalendarView({
  employeeId,
}: AttendanceCalendarViewProps) {
  const employees = useMockStore((s) => s.employees);
  const currentOrg = useMockStore((s) => s.getCurrentOrg());
  const leaveBalances = useMockStore((s) => s.leaveBalances);
  const currentUser = useMockStore((s) => s.currentUser);

  // Active employee context (defaults to employeeId, or current user, or sufian, or employees[0])
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    employeeId ||
      currentUser.employeeId ||
      employees.find((e) => e.email.includes("sufian"))?.id ||
      employees[0]?.id
  );

  const employee = useMemo(() => {
    return (
      employees.find((e) => e.id === (employeeId || selectedEmpId)) ||
      employees[0]
    );
  }, [employeeId, selectedEmpId, employees]);

  // Branch Scoping check
  const canManageThisEmployee = mockStore.canManageEmployee(employee?.id);
  const isSelf = currentUser.employeeId === employee?.id;
  const canPunchOrRegularize = canManageThisEmployee || isSelf;

  // Regularize Dialog state
  const [regularizeOpen, setRegularizeOpen] = useState(false);
  const [selectedDateToRegularize, setSelectedDateToRegularize] = useState<string>("2026-10-14");

  // Selected Month & Year
  const [selectedMonth, setSelectedMonth] = useState("10"); // 10 = October
  const [selectedYear, setSelectedYear] = useState("2026");

  const handlePrevMonth = () => {
    const cur = parseInt(selectedMonth);
    if (cur > 1) {
      setSelectedMonth(String(cur - 1).padStart(2, "0"));
    } else {
      setSelectedMonth("12");
      setSelectedYear(String(parseInt(selectedYear) - 1));
    }
  };

  const handleNextMonth = () => {
    const cur = parseInt(selectedMonth);
    if (cur < 12) {
      setSelectedMonth(String(cur + 1).padStart(2, "0"));
    } else {
      setSelectedMonth("01");
      setSelectedYear(String(parseInt(selectedYear) + 1));
    }
  };

  // Today punch status simulation
  const [hasCheckedIn, setHasCheckedIn] = useState(true);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [todayCheckInTime, setTodayCheckInTime] = useState("08:45 AM");
  const [todayCheckOutTime, setTodayCheckOutTime] = useState<string | null>(null);

  const handlePunchToggle = () => {
    if (!canPunchOrRegularize) {
      toast.error("Branch Permission Denied", {
        description: `As HR for ${currentUser.branchName || "your branch"}, you cannot punch attendance for ${employee.fullName} (${employee.branchName}).`,
      });
      return;
    }

    const nowTime = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());

    try {
      if (!hasCheckedIn) {
        setHasCheckedIn(true);
        setTodayCheckInTime(nowTime);
        mockStore.recordManualPunch(employee.id, "check_in");
        toast.success(`Check-in recorded at ${nowTime}`, {
          description: `Biometric punch synchronized for ${employee.fullName}.`,
        });
      } else if (!hasCheckedOut) {
        setHasCheckedOut(true);
        setTodayCheckOutTime(nowTime);
        mockStore.recordManualPunch(employee.id, "check_out");
        toast.success(`Check-out recorded at ${nowTime}`, {
          description: `Daily shift completed for ${employee.fullName}.`,
        });
      } else {
        toast.info("Shift already completed for today", {
          description: "Both check-in and check-out punches are already recorded.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Punch failed";
      toast.error("Action Denied", { description: msg });
    }
  };

  const handleDayClick = (dayData: CalendarDayData) => {
    if (!canPunchOrRegularize) {
      toast.error("Branch Permission Denied", {
        description: `As HR for ${currentUser.branchName || "your branch"}, you cannot regularize attendance for ${employee.fullName} (${employee.branchName}).`,
      });
      return;
    }
    setSelectedDateToRegularize(dayData.dateStr);
    setRegularizeOpen(true);
  };

  // Generate deterministic calendar days for selected month (e.g. Oct 2026)
  const { daysInMonth, startDayOffset, monthDaysData, stats } = useMemo(() => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth) - 1; // 0-indexed
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const offset = firstDay.getDay(); // 0 = Sunday

    const dayList: CalendarDayData[] = [];
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let offdayCount = 0;

    for (let d = 1; d <= totalDays; d++) {
      const currentDate = new Date(year, month, d);
      const dayOfWeek = currentDate.getDay();
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isPastOrToday = d <= 14; // current day is 14th

      let status: DayStatus;
      let checkIn: string | undefined;
      let checkOut: string | undefined;
      let duration: string | undefined;

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = "Offday";
        offdayCount++;
      } else if (d === 21 || d === 26) {
        status = "Holiday";
      } else if (d === 19) {
        status = "Leave";
        leaveCount++;
      } else if (isPastOrToday) {
        if (d === 3 || d === 17) {
          status = "Late";
          checkIn = "08:24 AM";
          checkOut = "05:15 PM";
          duration = "8 hr 51 min";
          lateCount++;
        } else if (d === 7 || d === 8) {
          status = "Absent";
          absentCount++;
        } else {
          status = "Present";
          checkIn = "07:58 AM";
          checkOut = "04:55 PM";
          duration = "8 hr 57 min";
          presentCount++;
        }
      } else {
        // Future days
        status = "Offday";
      }

      dayList.push({
        dayNumber: d,
        dateStr,
        status,
        checkIn,
        checkOut,
        duration,
        isToday: d === 14,
      });
    }

    return {
      daysInMonth: totalDays,
      startDayOffset: offset,
      monthDaysData: dayList,
      stats: {
        payableDays: totalDays - offdayCount,
        present: presentCount,
        late: lateCount,
        movement: 0,
        leave: leaveCount,
        absent: absentCount,
      },
    };
  }, [selectedMonth, selectedYear]);

  // Daily punch punch-list entries for the breakdown (ordered latest first)
  const recentPunches = useMemo(() => {
    return monthDaysData
      .filter((d) => d.status === "Present" || d.status === "Late" || d.isToday)
      .slice(0, 6);
  }, [monthDaysData]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">


      {/* Branch Access Alert if viewing employee outside HR branch */}
      {!canPunchOrRegularize && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
          <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold">Branch Scoping Restriction (Read-Only)</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
              You are active as <strong>{currentUser.name}</strong> ({currentUser.branchName || "Branch HR"}). Employee <strong>{employee.fullName}</strong> belongs to <strong>{employee.branchName}</strong>. You cannot record punches or regularize attendance for staff outside your branch.
            </p>
          </div>
        </div>
      )}

      {/* 1. Header Cards: Employee Greeting & Work Period + Organization Coordinates */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Banner: Greeting, Today Working Period, and Check-in Action */}
        <Card className="lg:col-span-7 border-border/80 shadow-xs overflow-hidden bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Hello,</span>
                <span className="text-base font-bold text-foreground">
                  {employee.fullName}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  Welcome Back !
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                14 October, 2026, Wednesday · {employee.branchName}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60">
              {/* Working Period */}
              <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border/60">
                <div className="size-11 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Clock className="size-6" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-medium text-muted-foreground block">
                    Today Working Period
                  </span>
                  <p className="text-xs font-bold text-foreground">
                    Morning 08:00 AM - 05:00 PM
                  </p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Standard Shift (9h with 1h break)
                  </span>
                </div>
              </div>

              {/* Check-in / Punch button */}
              <div className="flex flex-col justify-center gap-1.5 bg-primary/5 p-3 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-primary">
                    Attendance Action
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background text-foreground">
                    {!canPunchOrRegularize
                      ? "Read-Only"
                      : hasCheckedOut
                      ? "Clocked Out"
                      : hasCheckedIn
                      ? "Clocked In"
                      : "Pending Check-In"}
                  </Badge>
                </div>

                <Button
                  onClick={handlePunchToggle}
                  size="sm"
                  disabled={!canPunchOrRegularize}
                  className={`w-full text-xs font-semibold gap-1.5 h-8 ${
                    !canPunchOrRegularize
                      ? "opacity-50 cursor-not-allowed"
                      : hasCheckedOut
                      ? "bg-slate-700 text-white"
                      : hasCheckedIn
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {!canPunchOrRegularize ? (
                    <>
                      <Lock className="size-3.5" />
                      Branch Restricted
                    </>
                  ) : hasCheckedOut ? (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      Completed for Today
                    </>
                  ) : hasCheckedIn ? (
                    <>
                      <ArrowDown className="size-3.5" />
                      Check Out (Punch Out)
                    </>
                  ) : (
                    <>
                      <ArrowUp className="size-3.5" />
                      Please Check In
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canPunchOrRegularize}
                  onClick={() => {
                    setSelectedDateToRegularize(`${selectedYear}-${selectedMonth.padStart(2, "0")}-14`);
                    setRegularizeOpen(true);
                  }}
                  className="w-full text-xs font-medium gap-1.5 h-7 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Edit3 className="size-3" />
                  Regularize Punch Times
                </Button>

                <p className="text-[10px] text-muted-foreground text-center">
                  {hasCheckedIn && `In: ${todayCheckInTime}`}
                  {hasCheckedOut && ` · Out: ${todayCheckOutTime}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Banner: Company Branch & Employment Service Tenure */}
        <Card className="lg:col-span-5 border-border/80 shadow-xs overflow-hidden bg-card">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building className="size-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">
                  {currentOrg.name} [{employee.branchName.split(" ")[0] || "HQ"}]
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {employee.branchName} · Timezone: {currentOrg.timezone}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-xs">
              <div className="bg-muted/40 p-2.5 rounded-lg border border-border/40">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Service Tenure
                </span>
                <span className="font-bold text-foreground text-xs mt-0.5 block">
                  1 yr 4 mos
                </span>
              </div>

              <div className="bg-muted/40 p-2.5 rounded-lg border border-border/40">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Joining Date
                </span>
                <span className="font-bold text-foreground text-xs mt-0.5 block">
                  {employee.joiningDate || "01 Feb, 2026"}
                </span>
              </div>

              <div className="bg-muted/40 p-2.5 rounded-lg border border-border/40">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Status
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5 block capitalize">
                  Confirmed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Hero: Expansive Full-Width Attendance Calendar */}
      <Card className="w-full border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="flex flex-col gap-4 pb-4 border-b border-border/60 lg:flex-row lg:items-center lg:justify-between bg-muted/15">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                Monthly Attendance Calendar
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Biometric punch reconciliation & daily attendance logs for {employee.fullName}
              </p>
            </div>
          </div>

          {/* Month/Year Navigation Controls + KPI Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Prev/Next Month Controls */}
            <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border/80 shadow-xs">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handlePrevMonth}
                title="Previous Month"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v || "10")}>
                <SelectTrigger className="h-7 w-28 text-xs border-0 bg-transparent shadow-none font-semibold focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={(v) => setSelectedYear(v || "2026")}>
                <SelectTrigger className="h-7 w-20 text-xs border-0 bg-transparent shadow-none font-semibold focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025" className="text-xs">2025</SelectItem>
                  <SelectItem value="2026" className="text-xs">2026</SelectItem>
                  <SelectItem value="2027" className="text-xs">2027</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={handleNextMonth}
                title="Next Month"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Stats Summary Strip (Spacious & Clean) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 border border-border/60">
                <span className="font-bold text-foreground text-xs">{stats.payableDays}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Payable</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-xs">{stats.present}</span>
                <span className="text-[10px] uppercase font-semibold">Present</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span className="font-bold text-xs">{stats.late}</span>
                <span className="text-[10px] uppercase font-semibold">Late</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <span className="font-bold text-xs">{stats.leave}</span>
                <span className="text-[10px] uppercase font-semibold">Leave</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <span className="font-bold text-xs">{stats.absent}</span>
                <span className="text-[10px] uppercase font-semibold">Absent</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                <span className="font-bold text-xs">2</span>
                <span className="text-[10px] uppercase font-semibold">Holiday</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* Calendar Grid Container with horizontal scroll support on mobile */}
          <div className="overflow-x-auto">
            <div className="min-w-[760px] space-y-2">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-2 pb-2.5 text-center border-b border-border/70 text-xs font-bold">
                <span className="text-rose-600 dark:text-rose-400">Sun <span className="hidden sm:inline font-normal text-muted-foreground">(Sunday)</span></span>
                <span className="text-foreground">Mon <span className="hidden sm:inline font-normal text-muted-foreground">(Monday)</span></span>
                <span className="text-foreground">Tue <span className="hidden sm:inline font-normal text-muted-foreground">(Tuesday)</span></span>
                <span className="text-foreground">Wed <span className="hidden sm:inline font-normal text-muted-foreground">(Wednesday)</span></span>
                <span className="text-foreground">Thu <span className="hidden sm:inline font-normal text-muted-foreground">(Thursday)</span></span>
                <span className="text-foreground">Fri <span className="hidden sm:inline font-normal text-muted-foreground">(Friday)</span></span>
                <span className="text-sky-600 dark:text-sky-400">Sat <span className="hidden sm:inline font-normal text-muted-foreground">(Saturday)</span></span>
              </div>

              {/* Calendar Days Matrix (Generous width & height for each cell) */}
              <div className="grid grid-cols-7 gap-2 pt-2">
                {/* Empty cells before start day */}
                {Array.from({ length: startDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[88px] sm:min-h-[96px] rounded-xl bg-muted/10 border border-dashed border-border/40" />
                ))}

                {/* Day Cells */}
                {monthDaysData.map((d) => {
                  let badgeColor = "bg-muted text-muted-foreground border-border";
                  if (d.status === "Present") {
                    badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
                  } else if (d.status === "Late") {
                    badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-700";
                  } else if (d.status === "Absent") {
                    badgeColor = "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-700";
                  } else if (d.status === "Holiday") {
                    badgeColor = "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300 dark:border-sky-700";
                  } else if (d.status === "Leave") {
                    badgeColor = "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700";
                  }

                  return (
                    <div
                      key={d.dayNumber}
                      onClick={() => handleDayClick(d)}
                      title={
                        canPunchOrRegularize
                          ? `Click to regularize attendance for ${d.dateStr} (${d.status})`
                          : `Locked: Stationed in ${employee.branchName} (Outside ${currentUser.branchName || "your branch"})`
                      }
                      className={`min-h-[88px] sm:min-h-[96px] p-2 sm:p-2.5 rounded-xl border flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                        d.isToday
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs hover:bg-primary/10"
                          : "border-border/70 bg-card hover:border-primary/50 hover:bg-muted/30 hover:shadow-xs"
                      } ${!canPunchOrRegularize ? "opacity-90" : ""}`}
                    >
                      {/* Cell Top: Day Number & Today indicator */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            d.isToday ? "text-primary font-black" : "text-foreground"
                          }`}
                        >
                          {d.dayNumber}
                        </span>
                        {d.isToday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground uppercase tracking-wider">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Cell Middle: Full Status Badge (No Truncation!) */}
                      <div className="my-1">
                        <span
                          className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border inline-block ${badgeColor}`}
                        >
                          {d.status}
                        </span>
                      </div>

                      {/* Cell Bottom: Punch times or notes */}
                      <div className="text-[10px] text-muted-foreground truncate">
                        {d.status === "Present" && (
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                            {d.checkIn ? `${d.checkIn} - ${d.checkOut || "Active"}` : "08:00 - 17:00"}
                          </span>
                        )}
                        {d.status === "Late" && (
                          <span className="font-mono text-amber-700 dark:text-amber-400 font-medium">
                            {d.checkIn ? `${d.checkIn} - ${d.checkOut || "Active"}` : "08:30 - 17:00"}
                          </span>
                        )}
                        {d.status === "Holiday" && (
                          <span className="text-sky-700 dark:text-sky-300 font-medium truncate block">
                            {d.dayNumber === 21 ? "Deepavali" : "Company Day"}
                          </span>
                        )}
                        {d.status === "Leave" && (
                          <span className="text-indigo-700 dark:text-indigo-300 font-medium truncate block">
                            Approved Leave
                          </span>
                        )}
                        {d.status === "Absent" && (
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            Unscheduled
                          </span>
                        )}
                        {d.status === "Offday" && (
                          <span className="text-muted-foreground/80">
                            Weekend Rest
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Complementary Details: Daily Punches Timeline, Reporting Managers, Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Daily Punches & Work Hours Log */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              Daily Punches & Work Hours
            </CardTitle>
            <span className="text-[10px] text-muted-foreground">Recent Days</span>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 max-h-[380px] overflow-y-auto scrollbar-thin">
            {recentPunches.map((item) => (
              <div
                key={item.dateStr}
                className="p-2.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    {item.dayNumber} Oct, 2026 {item.isToday && "(Today)"}
                  </span>
                  {item.duration && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground">
                      {item.duration}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <ArrowUp className="size-3 shrink-0" />
                    <span>In: {item.checkIn || "08:45 AM"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <ArrowDown className="size-3 shrink-0" />
                    <span>Out: {item.checkOut || "Active"}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 2: My Reporting Managers */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="size-3.5 text-primary" />
              My Reporting Managers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  FA
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-xs font-bold text-foreground">Fahim Arefin</h4>
                <p className="text-[11px] text-muted-foreground">Supervisor · Engineering</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  MH
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-xs font-bold text-foreground">Maruf Hossain</h4>
                <p className="text-[11px] text-muted-foreground">Dotted Supervisor · Product</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  NH
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-xs font-bold text-foreground">Md. Nasib Hasan</h4>
                <p className="text-[11px] text-muted-foreground">Line Manager · Director</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Leave Balance Table */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
              Leave Balance
            </CardTitle>
            <span className="text-[10px] text-primary hover:underline cursor-pointer font-medium">
              Active Year 2026
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 text-[10px] text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="py-2 px-3 text-left">Type</th>
                  <th className="py-2 px-2 text-center">Taken</th>
                  <th className="py-2 px-2 text-center">Balance</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {leaveBalances.map((bal) => (
                  <tr key={bal.leaveType} className="hover:bg-muted/20">
                    <td className="py-2 px-3 font-medium text-foreground">
                      {bal.title}
                    </td>
                    <td className="py-2 px-2 text-center text-muted-foreground font-mono">
                      {bal.used}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-foreground font-mono">
                      {bal.remaining}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Manual Regularize Dialog */}
      <AttendanceRegularizeDialog
        open={regularizeOpen}
        onOpenChange={setRegularizeOpen}
        employee={employee}
        initialDate={selectedDateToRegularize}
      />
    </div>
  );
}
