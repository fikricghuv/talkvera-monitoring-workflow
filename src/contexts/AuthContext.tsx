// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Permission, Role } from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  hasPermission: (resource: string, action?: string) => boolean;
  hasRole: (roleName: string) => boolean;
  hasAnyPermission: (resources: string[], action?: string) => boolean;
  signOut: () => Promise<void>;
  refetchPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRolesAndPermissions = useCallback(async (userId: string) => {
    try {
      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('ms_user_roles')
        .select(`
          role_id,
          ms_roles (
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      const fetchedRoles = userRoles?.map((ur: any) => ur.ms_roles).filter(Boolean) || [];
      setRoles(fetchedRoles);

      // Fetch permissions based on roles
      const roleIds = fetchedRoles.map((r: any) => r.id);
      
      if (roleIds.length > 0) {
        const { data: rolePermissions, error: permError } = await supabase
          .from('ms_role_permissions')
          .select(`
            permission_id,
            ms_permissions (
              id,
              resource_id,
              action_id,
              ms_resources (
                id,
                resource_key,
                description
              ),
              ms_actions (
                id,
                action_key,
                description
              )
            )
          `)
          .in('role_id', roleIds);

        if (permError) throw permError;

        const fetchedPermissions = rolePermissions
          ?.map((rp: any) => {
            const perm = rp.ms_permissions;
            if (!perm) return null;
            
            return {
              id: perm.id,
              resource_id: perm.resource_id,
              action_id: perm.action_id,
              resource: perm.ms_resources,
              action: perm.ms_actions,
            };
          })
          .filter(Boolean) || [];

        setPermissions(fetchedPermissions);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching roles and permissions:', error);
      setRoles([]);
      setPermissions([]);
    }
  }, []);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRolesAndPermissions(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        fetchUserRolesAndPermissions(session.user.id).finally(() => setLoading(false));
      } else {
        setRoles([]);
        setPermissions([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRolesAndPermissions]);

  // Cek apakah user memiliki role admin
  const isAdmin = useCallback((): boolean => {
    return roles.some(role => role.name === 'admin');
  }, [roles]);

  // Cek permission berdasarkan resource dan action
  const hasPermission = useCallback((resource: string, action: string = 'view'): boolean => {
    // Admin has access to everything
    if (isAdmin()) {
      return true;
    }
    
    // Check if user has permission for this resource and action
    return permissions.some(
      permission => 
        permission.resource?.resource_key === resource && 
        permission.action?.action_key === action
    );
  }, [permissions, isAdmin]);

  // Cek apakah user memiliki minimal satu permission dari list resources
  const hasAnyPermission = useCallback((resources: string[], action: string = 'view'): boolean => {
    // Admin has access to everything
    if (isAdmin()) {
      return true;
    }
    
    // Check if user has any of the permissions
    return resources.some(resource => hasPermission(resource, action));
  }, [hasPermission, isAdmin]);

  const hasRole = useCallback((roleName: string): boolean => {
    return roles.some(role => role.name === roleName);
  }, [roles]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRoles([]);
    setPermissions([]);
  };

  const refetchPermissions = async () => {
    if (user) {
      setLoading(true);
      await fetchUserRolesAndPermissions(user.id);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        loading,
        hasPermission,
        hasRole,
        hasAnyPermission,
        signOut,
        refetchPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};