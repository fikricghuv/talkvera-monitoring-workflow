// pages/RoleManagement.tsx

import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Hooks
import { useRoleManagementData } from '../hooks/useRoleManagementData';

// Components
import { RoleManagementHeader } from '../components/roleManagement/RoleManagementHeader';
import { RoleMetrics } from '../components/roleManagement/RoleMetrics';
import { AssignRoleForm } from '../components/roleManagement/AssignRoleForm';
import { RoleManagementTable } from '../components/roleManagement/RoleManagementTable';
import { RoleManagementSkeleton } from '../components/roleManagement/RoleManagementSkeleton';

/**
 * Main page component untuk Role Management
 */
const RoleManagementPage: React.FC = () => {
  // ========== STATE MANAGEMENT ==========
  const { users, roles, metrics, isLoading, refetch } = useRoleManagementData();
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const { refetchPermissions } = useAuth();

  // ========== EVENT HANDLERS ==========

  /**
   * Handle assign role ke user
   */
  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.rpc('assign_user_role', {
        target_user_id: selectedUser,
        target_role_id: selectedRole,
      });

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Role berhasil ditambahkan ke user.',
      });

      // Refresh data dan permissions
      await refetch();
      await refetchPermissions();
      
      setSelectedUser('');
      setSelectedRole('');
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Gagal Assign Role',
        description: error.message || 'Terjadi kesalahan saat menyimpan.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle remove role dari user
   * NOTE: Konfirmasi sudah dilakukan di RoleManagementTable component (modal)
   * Jadi di sini langsung execute tanpa konfirmasi lagi
   */
  const handleRemoveRole = async (userId: string, roleId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc('remove_user_role', {
        target_user_id: userId,
        target_role_id: roleId,
      });

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Role berhasil dihapus.',
      });

      await refetch();
      await refetchPermissions();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: 'Gagal Menghapus Role',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ========== RENDER ==========

  // Show skeleton on initial load
  if (isLoading && users.length === 0) {
    return <RoleManagementSkeleton />;
  }

  return (
    <div className="space-y-6 pl-4 pr-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <RoleManagementHeader />
        
        {/* KPI Metrics */}
        <RoleMetrics metrics={metrics} />
        
        {/* Assign Role Form */}
        <AssignRoleForm
          users={users}
          roles={roles}
          selectedUser={selectedUser}
          selectedRole={selectedRole}
          loading={actionLoading}
          onUserChange={setSelectedUser}
          onRoleChange={setSelectedRole}
          onAssign={handleAssignRole}
        />
        
        {/* Users & Roles Table */}
        <RoleManagementTable
          users={users}
          loading={actionLoading}
          onRemoveRole={handleRemoveRole}
        />
      </div>
    </div>
  );
};

export default RoleManagementPage;