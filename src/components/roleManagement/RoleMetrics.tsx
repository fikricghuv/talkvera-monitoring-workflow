// components/roleManagement/RoleMetrics.tsx

import React from 'react';
import { Users, UserCheck, Award, Shield } from 'lucide-react';
import { RoleMetrics as RoleMetricsType } from '../../types/roleManagement';
import { AnimatedMetricCard } from "../AnimatedMetricCard";

interface RoleMetricsProps {
  metrics: RoleMetricsType;
}

/**
 * Component untuk menampilkan KPI metrics cards
 */
export const RoleMetrics: React.FC<RoleMetricsProps> = ({ metrics }) => {
  const assignmentPercentage = metrics.totalUsers > 0
    ? ((metrics.usersWithRoles / metrics.totalUsers) * 100).toFixed(0)
    : "0";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Users */}
      <AnimatedMetricCard
        title="Total Users"
        value={metrics.totalUsers}
        suffix=""
        icon={<Users className="h-5 w-5 text-blue-500" />}
        borderColor="border-blue-500"
        subtitle="Total pengguna"
        decimals={0}
      />

      {/* Users with Roles */}
      <AnimatedMetricCard
        title="Users with Roles"
        value={metrics.usersWithRoles}
        suffix=""
        icon={<UserCheck className="h-5 w-5 text-green-500" />}
        borderColor="border-green-500"
        subtitle={metrics.usersWithRoles > 0
          ? `${assignmentPercentage}% dari total`
          : "Tidak ada data"}
        decimals={0}
      />

      {/* Role Assignments */}
      <AnimatedMetricCard
        title="Role Assignments"
        value={metrics.totalRoleAssignments}
        suffix=""
        icon={<Award className="h-5 w-5 text-purple-500" />}
        borderColor="border-purple-500"
        subtitle="Total role diberikan"
        decimals={0}
      />

      {/* Available Roles */}
      <AnimatedMetricCard
        title="Available Roles"
        value={metrics.availableRoles}
        suffix=""
        icon={<Shield className="h-5 w-5 text-orange-500" />}
        borderColor="border-orange-500"
        subtitle="Role tersedia"
        decimals={0}
      />
    </div>
  );
};