import * as React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 pb-6 border-b border-border/60 last:border-0 last:pb-0 md:grid-cols-3",
        className
      )}
    >
      <div className="space-y-1 md:col-span-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4 md:col-span-2">{children}</div>
    </div>
  );
}
