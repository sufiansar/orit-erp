import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "default" | "full" | "narrow";
}

export function PageContainer({
  children,
  className,
  maxWidth = "default",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex-1 p-6 space-y-6 animate-in fade-in-50 duration-200",
        {
          "max-w-7xl mx-auto w-full": maxWidth === "default",
          "w-full": maxWidth === "full",
          "max-w-4xl mx-auto w-full": maxWidth === "narrow",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
