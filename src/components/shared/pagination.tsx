import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1 && totalItems <= pageSize) {
    return (
      <div className="flex items-center justify-between px-2 py-3 text-xs text-muted-foreground border-t border-border/60">
        <span>Showing {totalItems} total entries</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-2 py-3 text-xs sm:flex-row sm:items-center sm:justify-between border-t border-border/60">
      <span className="text-muted-foreground">
        Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
        <span className="font-medium text-foreground">{endItem}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span> entries
      </span>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 gap-1 px-2.5 text-xs"
        >
          <ChevronLeft className="size-3.5" />
          Previous
        </Button>

        <span className="px-2 text-xs font-medium">
          {currentPage} / {totalPages || 1}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 gap-1 px-2.5 text-xs"
        >
          Next
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
