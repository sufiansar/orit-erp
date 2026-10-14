import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn("overflow-hidden border-border/80 shadow-xs", className)}>
      {(title || description || action) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b border-border/60">
          <div className="space-y-1">
            {title && (
              <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-xs text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
