import * as React from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FilterBar({ children, className, ...props }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
