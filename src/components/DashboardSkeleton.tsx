import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 pl-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* Workflow Execution Metrics Skeleton */}
        <div>
          <Skeleton className="h-6 w-56 mb-3" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg border-l-4 border-gray-300 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ))}
        </div>

        {/* Combined Chart Skeleton */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Skeleton className="h-6 w-64 mb-4" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  );
};