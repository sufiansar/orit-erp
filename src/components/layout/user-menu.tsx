"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Shield,
  LogOut,
  Moon,
  Sun,
  Laptop,
  Check,
  UserCheck,
  Building,
  UserCheck2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useMockStore, mockStore } from "@/lib/mock-api/store";
import { DEMO_USERS, DemoUserCredential } from "@/lib/mock-api/data";

export function UserMenu() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const currentUser = useMockStore((s) => s.currentUser);

  const handleSignOut = () => {
    toast.success("Signed out successfully (Simulated session ended)");
    router.push("/login");
  };

  const handleSwitchPersona = (user: DemoUserCredential) => {
    mockStore.setCurrentUser(user);
    if (user.roleType === "hr_admin") {
      toast.info(`Active: ${user.name} (Branch HR)`, {
        description: `Branch-scoped authority: Only employees in ${user.branchName || "Singapore HQ"} can be modified.`,
      });
    } else if (user.roleType === "org_admin") {
      toast.success(`Active: ${user.name} (Org Admin)`, {
        description: "Full company access across all branches, leaves & settings.",
      });
    } else if (user.roleType === "employee") {
      toast.info(`Active: ${user.name} (Staff Employee)`, {
        description: "Self-service calendar, punch in/out & personal leave requests.",
      });
    } else {
      toast.success(`Active: ${user.name} (System Admin)`, {
        description: "SaaS owner platform overview & tenant management.",
      });
    }
  };

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:opacity-90 transition-opacity cursor-pointer">
        <Avatar className="size-8 border border-border">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-lg">
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground truncate">
                {currentUser.name}
              </p>
              <span className="text-[10px] rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                {currentUser.badge}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser.email}
            </p>
            {currentUser.branchName && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Building className="size-3 text-primary shrink-0" />
                <span className="truncate">{currentUser.branchName}</span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* 1-Click Role / Persona Switcher Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="py-2 text-xs gap-2.5 font-medium">
            <UserCheck2 className="size-4 text-primary" />
            <span>Switch Role Persona</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64 p-1">
            <DropdownMenuLabel className="px-2 py-1 text-[11px] text-muted-foreground">
              Select Demo Persona
            </DropdownMenuLabel>
            {DEMO_USERS.map((u) => {
              const isSelected = u.email === currentUser.email;
              return (
                <DropdownMenuItem
                  key={u.email}
                  onClick={() => handleSwitchPersona(u)}
                  className="cursor-pointer py-2 text-xs flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground truncate">
                      {u.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {u.title}
                    </span>
                    {u.branchName && (
                      <span className="text-[9px] text-primary/80 truncate">
                        Branch: {u.branchName}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="size-4 text-primary shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer py-2 text-xs flex items-center gap-2.5"
          onClick={() => router.push("/settings/general")}
        >
          <Settings className="size-4 text-muted-foreground" />
          <span>Organization Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer py-2 text-xs flex items-center gap-2.5"
          onClick={() => router.push("/settings/security")}
        >
          <Shield className="size-4 text-muted-foreground" />
          <span>Security & Sessions</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="py-2 text-xs gap-2.5">
            {theme === "dark" ? (
              <Moon className="size-4 text-muted-foreground" />
            ) : (
              <Sun className="size-4 text-muted-foreground" />
            )}
            <span>Theme Appearance</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-36">
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className="text-xs cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Sun className="size-3.5" />
                <span>Light</span>
              </div>
              {theme === "light" && <Check className="size-3.5 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className="text-xs cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Moon className="size-3.5" />
                <span>Dark</span>
              </div>
              {theme === "dark" && <Check className="size-3.5 text-primary" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className="text-xs cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Laptop className="size-3.5" />
                <span>System</span>
              </div>
              {theme === "system" && <Check className="size-3.5 text-primary" />}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer py-2 text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 gap-2.5"
        >
          <LogOut className="size-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
