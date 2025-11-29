// hooks/useRoleManagementData.ts

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Role, RoleMetrics } from '../types/roleManagement';

/**
 * Custom hook untuk fetch dan manage role management data
 */
export const useRoleManagementData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [metrics, setMetrics] = useState<RoleMetrics>({
    totalUsers: 0,
    usersWithRoles: 0,
    totalRoleAssignments: 0,
    availableRoles: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsersAndRoles = async () => {
    try {
      // Panggil RPC get_all_users_secure
      const { data: authUsersData, error: authError } = await supabase
        .rpc('get_all_users_secure');

      if (authError) throw authError;

      const usersMap = new Map<string, User>();
      
      // Inisialisasi Map User
      if (authUsersData) {
        (authUsersData as any[]).forEach(user => {
          usersMap.set(user.id, {
            id: user.id,
            email: user.email || `User ID: ${user.id}`, 
            roles: []
          });
        });
      }
      
      // Ambil relasi user_roles
      const { data: userRolesData, error: urError } = await supabase
        .from('ms_user_roles')
        .select(`
          user_id,
          role_id,
          ms_roles (
            id,
            name
          )
        `);

      if (urError) throw urError;

      // Gabungkan data role ke user
      userRolesData?.forEach((ur: any) => {
        const user = usersMap.get(ur.user_id);
        if (user && ur.ms_roles) {
          user.roles.push({
            id: ur.role_id, 
            name: ur.ms_roles.name,
          });
        }
      });

      const usersList = Array.from(usersMap.values());
      setUsers(usersList);

      // Calculate metrics
      const usersWithRoles = usersList.filter(u => u.roles.length > 0).length;
      const totalRoleAssignments = usersList.reduce((sum, u) => sum + u.roles.length, 0);
      
      setMetrics(prev => ({
        ...prev,
        totalUsers: usersList.length,
        usersWithRoles,
        totalRoleAssignments,
      }));

    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Gagal Memuat Data',
        description: error.message || 'Pastikan Anda login sebagai Admin.', 
        variant: 'destructive',
      });
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('ms_roles')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setRoles(data || []);
      setMetrics(prev => ({
        ...prev,
        availableRoles: data?.length || 0,
      }));
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data role',
        variant: 'destructive',
      });
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUsersAndRoles(),
        fetchRoles(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    users,
    roles,
    metrics,
    isLoading,
    refetch: fetchData,
    setUsers,
  };
};