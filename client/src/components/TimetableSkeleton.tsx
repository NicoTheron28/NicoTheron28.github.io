import { Skeleton } from "@/components/ui/skeleton";

export function TimetableSkeleton({ rows = 9 }: { rows?: number }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Stoor / Deel button row */}
      <div className="flex justify-center gap-3 mb-3">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      {/* Card */}
      <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-border">
        {/* Header */}
        <div className="flex flex-col items-center mb-2 gap-1">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-3.5 w-32 rounded" />
          <Skeleton className="h-2 w-44 rounded" />
        </div>

        {/* Period rows */}
        <div className="space-y-0.5">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-1 rounded-md border border-border/30"
            >
              <Skeleton className="h-2.5 w-20 rounded" />
              <Skeleton className="h-4 w-20 rounded-sm" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-2 pt-1 border-t border-dotted border-border/40 flex justify-between items-center px-1">
          <Skeleton className="h-2 w-20 rounded" />
          <Skeleton className="h-2 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}
