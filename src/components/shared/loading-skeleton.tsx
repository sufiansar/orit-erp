import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between pb-2">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 py-2 border-b border-border/40">
          <Skeleton className="size-9 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function CardsLoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
