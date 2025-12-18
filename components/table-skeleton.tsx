import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
  compact?: boolean;
}

export default function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
  showHeader = true,
  compact = false,
}: TableSkeletonProps) {
  return (
    <div className={cn("border rounded-lg bg-card", className)}>
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          {showHeader && (
            <thead className="border-b bg-muted/50">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="h-12 px-4 text-left">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="p-4">
                    <div className="space-y-2">
                      <div
                        className={cn(
                          "bg-muted rounded animate-pulse",
                          compact ? "h-3" : "h-4",
                          colIndex === 0 ? "w-full" : "w-2/3"
                        )}
                      />
                      {!compact && colIndex === 0 && (
                        <div className="h-2 bg-muted rounded w-1/4 animate-pulse" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
