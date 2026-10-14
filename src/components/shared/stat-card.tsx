import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  className?: string;
  badge?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  trend = "neutral",
  subtitle,
  className,
  badge,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-sm hover:border-primary/30",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon className="size-5" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </span>
          {badge && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {badge}
            </span>
          )}
        </div>

        {(change || subtitle) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {change && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded",
                  {
                    "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40":
                      trend === "up",
                    "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40":
                      trend === "down",
                    "text-muted-foreground bg-muted": trend === "neutral",
                  }
                )}
              >
                {trend === "up" && <TrendingUp className="size-3" />}
                {trend === "down" && <TrendingDown className="size-3" />}
                {trend === "neutral" && <Minus className="size-3" />}
                {change}
              </span>
            )}
            {subtitle && (
              <span className="text-muted-foreground truncate">{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
