"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Clock,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "./app-sidebar";
import { UserMenu } from "./user-menu";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { DEMO_USERS } from "@/lib/mock-api/data";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  onOpenSearch?: () => void;
}

export function AppHeader({ onOpenSearch }: AppHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentOrg = useMockStore((s) => s.getCurrentOrg());
  const currentUser = useMockStore((s) => s.currentUser);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat("en-US", {
          timeZone: currentOrg.timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(new Date());
        setCurrentTime(timeStr);
      } catch {
        setCurrentTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [currentOrg.timezone]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="md:hidden size-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r border-sidebar-border">
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Global Search Affordance */}
        <button
          type="button"
          onClick={() => {
            if (onOpenSearch) {
              onOpenSearch();
            } else {
              toast.info("Global Search (Ctrl + K)", {
                description: "Type employee names, branch codes, or system actions.",
              });
            }
          }}
          className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all sm:w-64 cursor-pointer"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="truncate">Search employees, actions...</span>
          <kbd className="hidden sm:inline-flex ml-auto pointer-events-none h-4 select-none items-center gap-1 rounded bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground border border-border">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role & Branch Scope Pill */}
        <DropdownMenu>
          <DropdownMenuTrigger className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 hover:bg-muted/70 px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer shadow-2xs">
            <span
              className={`size-2 rounded-full ${
                currentUser.roleType === "hr_admin"
                  ? "bg-amber-500 animate-pulse"
                  : currentUser.roleType === "org_admin"
                  ? "bg-indigo-500"
                  : currentUser.roleType === "manager"
                  ? "bg-sky-500"
                  : currentUser.roleType === "employee"
                  ? "bg-emerald-500"
                  : "bg-purple-500"
              }`}
            />
            <span className="font-semibold text-foreground text-xs">{currentUser.name}</span>
            <span className="text-[10px] text-muted-foreground border-l border-border/80 pl-1.5">
              {currentUser.roleType === "hr_admin"
                ? "HR (Singapore HQ)"
                : currentUser.roleType === "org_admin"
                ? "Org Admin"
                : currentUser.roleType === "manager"
                ? "Manager (Sarah)"
                : currentUser.roleType === "employee"
                ? "Employee (Sufian)"
                : "SaaS Admin"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-lg">
            <DropdownMenuLabel className="px-2 py-1 text-[11px] text-muted-foreground">
              Switch Demo Role Persona
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {DEMO_USERS.map((u) => {
              const active = u.email === currentUser.email;
              return (
                <DropdownMenuItem
                  key={u.email}
                  onClick={() => {
                    mockStore.setCurrentUser(u);
                    toast.info(`Active User: ${u.name}`, {
                      description: u.description,
                    });
                  }}
                  className="cursor-pointer py-1.5 text-xs flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground truncate">{u.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{u.title}</span>
                    {u.branchName && (
                      <span className="text-[9px] text-amber-600 dark:text-amber-400">
                        {u.branchName}
                      </span>
                    )}
                  </div>
                  {active && <Check className="size-4 text-primary shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Organization Timezone & Local Clock */}
        <div className="hidden xl:flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground border border-border/40">
          <Clock className="size-3.5 text-primary" />
          <span className="font-medium text-foreground">{currentTime}</span>
          <span className="text-[11px] text-muted-foreground/80">({currentOrg.timezone.split("/")[1]?.replace("_", " ") || currentOrg.timezone})</span>
        </div>

        {/* Notifications Popover */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative size-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-primary animate-pulse" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 shadow-lg">
            <DropdownMenuLabel className="flex items-center justify-between text-xs font-semibold px-2 py-1">
              <span>Recent Alerts & Notifications</span>
              <span className="text-[10px] text-primary font-medium">3 unread</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1.5 py-1">
              <DropdownMenuItem className="p-2 cursor-pointer flex flex-col items-start gap-1 rounded-md">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-foreground">Leave Request</span>
                  <span className="text-[10px] text-muted-foreground">10m ago</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sophia Martinez submitted annual leave for Oct 20–24.
                </p>
              </DropdownMenuItem>

              <DropdownMenuItem className="p-2 cursor-pointer flex flex-col items-start gap-1 rounded-md">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-foreground">Biometric Terminal</span>
                  <span className="text-[10px] text-muted-foreground">1h ago</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Singapore HQ face terminal synced 42 punches successfully.
                </p>
              </DropdownMenuItem>

              <DropdownMenuItem className="p-2 cursor-pointer flex flex-col items-start gap-1 rounded-md">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-foreground">Workflow Updated</span>
                  <span className="text-[10px] text-muted-foreground">Yesterday</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Multi-Tier Leave Approval v3 published by Alina Vance.
                </p>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Documentation / Help Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            toast.info("OrbitERP Documentation & Help Center", {
              description: "Comprehensive guides for modules, biometric device protocols & workflows.",
            });
          }}
          className="size-9 text-muted-foreground hover:text-foreground hidden sm:flex"
          aria-label="Help and guides"
        >
          <HelpCircle className="size-4" />
        </Button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
