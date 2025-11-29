// types/roleManagement.ts

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface UserRole {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  roles: UserRole[];
}

export interface RoleMetrics {
  totalUsers: number;
  usersWithRoles: number;
  totalRoleAssignments: number;
  availableRoles: number;
}