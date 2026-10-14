"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMockStore } from "@/lib/mock-api/store";
import { MAIN_NAV_SECTIONS, PLATFORM_ADMIN_NAV } from "@/config/navigation";
import { NavIcon } from "./nav-icon";
import { Search, ArrowRight, CornerDownLeft } from "lucide-react";

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchModal({
  open,
  onOpenChange,
}: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const employees = useMockStore((s) => s.employees);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  const allNavItems = [
    ...MAIN_NAV_SECTIONS.flatMap((s) => s.items),
    ...PLATFORM_ADMIN_NAV.items,
  ];

  const filteredNav = query
    ? allNavItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allNavItems.slice(0, 6);

  const filteredEmployees = query
    ? employees.filter(
        (e) =>
          e.fullName.toLowerCase().includes(query.toLowerCase()) ||
          e.employeeCode.toLowerCase().includes(query.toLowerCase()) ||
          e.departmentName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const handleNavigate = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-lg overflow-hidden border-border/80 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Global Quick Search</DialogTitle>
        </DialogHeader>

        <div className="flex items-center border-b border-border/80 px-4 py-3">
          <Search className="size-4 text-muted-foreground mr-2 shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a page name or employee code..."
            className="border-0 shadow-none focus-visible:ring-0 text-sm px-0 h-8"
            autoFocus
          />
          <kbd className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Navigation Results */}
          <div>
            <span className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation Pages
            </span>
            <div className="mt-1 space-y-1">
              {filteredNav.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className="w-full flex items-center justify-between rounded-md p-2 text-left text-xs hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <NavIcon name={item.icon} className="size-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      {item.description && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-xs">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <CornerDownLeft className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Employee Results */}
          {filteredEmployees.length > 0 && (
            <div>
              <span className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Staff Members
              </span>
              <div className="mt-1 space-y-1">
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleNavigate(`/employees/${emp.id}`)}
                    className="w-full flex items-center justify-between rounded-md p-2 text-left text-xs hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{emp.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {emp.employeeCode} · {emp.departmentName}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && filteredNav.length === 0 && filteredEmployees.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching pages or employees found for &quot;{query}&quot;.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
