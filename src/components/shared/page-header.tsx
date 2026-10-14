import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbItem } from "@/types/common";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/70 bg-card/60 px-6 py-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  <Home className="size-3.5" />
                  <span className="sr-only">Home</span>
                </Link>
              </li>
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3 text-muted-foreground/60" />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
