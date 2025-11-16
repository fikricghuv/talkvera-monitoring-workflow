// src/components/AgentOverviewSkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for agent overview page
 */
export const AgentOverviewSkeleton = () => {
  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Date Filter Skeleton */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg border-l-4 border-gray-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-64 w-full" />
            </div>
          ))}
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-64 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};