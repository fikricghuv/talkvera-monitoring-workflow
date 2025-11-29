// src/types/auth.types.ts

export interface Action {
  id: string;
  action_key: string; // 'view', 'create', 'update', 'delete'
  description: string;
  created_at?: string;
}

export interface Resource {
  id: string;
  resource_key: string; // 'appointment', 'patient', 'chat_session', etc.
  description: string;
  created_at?: string;
}

export interface Permission {
  id: string;
  resource_id: string;
  action_id: string;
  resource?: Resource;
  action?: Action;
  created_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at?: string;
  roles?: Role;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at?: string;
  permissions?: Permission;
}

export interface AuthContextType {
  user: any | null;
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  hasPermission: (resource: string, action?: string) => boolean;
  hasRole: (roleName: string) => boolean;
  hasAnyPermission: (resources: string[], action?: string) => boolean;
  signOut: () => Promise<void>;
}