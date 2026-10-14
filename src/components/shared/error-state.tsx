import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this section. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/40 p-8 text-center dark:border-rose-900/50 dark:bg-rose-950/20",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 mb-3">
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-950 dark:text-rose-200">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-rose-700/80 dark:text-rose-300/80">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 gap-2 border-rose-200 hover:bg-rose-100 dark:border-rose-800"
        >
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
