import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  label?: string;
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/[\s-]/g, "_");

  let colorClasses = "bg-muted text-muted-foreground border-border";

  switch (normalized) {
    case "active":
    case "present":
    case "approved":
    case "connected":
    case "paid":
    case "published":
      colorClasses =
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
      break;

    case "pending":
    case "trial":
    case "syncing":
    case "draft":
      colorClasses =
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
      break;

    case "late":
    case "early_exit":
    case "half_day":
      colorClasses =
        "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800";
      break;

    case "absent":
    case "rejected":
    case "failed":
    case "suspended":
    case "offline":
    case "error":
      colorClasses =
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
      break;

    case "on_leave":
    case "inactive":
    case "cancelled":
    case "archived":
      colorClasses =
        "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      break;
  }

  const displayText =
    label ||
    status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium capitalize text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5",
        colorClasses,
        className
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", {
          "bg-emerald-500":
            ["active", "present", "approved", "connected", "paid", "published"].includes(normalized),
          "bg-amber-500":
            ["pending", "trial", "syncing", "draft"].includes(normalized),
          "bg-orange-500":
            ["late", "early_exit", "half_day"].includes(normalized),
          "bg-rose-500":
            ["absent", "rejected", "failed", "suspended", "offline", "error"].includes(normalized),
          "bg-slate-400":
            ["on_leave", "inactive", "cancelled", "archived"].includes(normalized),
        })}
      />
      {displayText}
    </Badge>
  );
}
