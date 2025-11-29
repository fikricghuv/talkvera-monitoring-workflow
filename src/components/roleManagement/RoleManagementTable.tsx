// components/roleManagement/RoleManagementTable.tsx

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { User } from '../../types/roleManagement';
import { RoleDeleteConfirmationModal } from './RoleDeleteConfirmationModal';

interface RoleManagementTableProps {
  users: User[];
  loading: boolean;
  onRemoveRole: (userId: string, roleId: string) => void;
}

interface DeleteModalState {
  isOpen: boolean;
  userId: string;
  roleId: string;
  userEmail: string;
  roleName: string;
}

/**
 * Table component untuk menampilkan list users dan roles
 */
export const RoleManagementTable: React.FC<RoleManagementTableProps> = ({
  users,
  loading,
  onRemoveRole,
}) => {
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    userId: '',
    roleId: '',
    userEmail: '',
    roleName: '',
  });

  /**
   * Handle klik button delete - buka modal konfirmasi
   */
  const handleDeleteClick = (userId: string, roleId: string, userEmail: string, roleName: string) => {
    setDeleteModal({
      isOpen: true,
      userId,
      roleId,
      userEmail,
      roleName,
    });
  };

  /**
   * Handle konfirmasi delete dari modal
   */
  const handleConfirmDelete = () => {
    onRemoveRole(deleteModal.userId, deleteModal.roleId);
    setDeleteModal({ isOpen: false, userId: '', roleId: '', userEmail: '', roleName: '' });
  };

  /**
   * Handle close modal
   */
  const handleCloseModal = () => {
    setDeleteModal({ isOpen: false, userId: '', roleId: '', userEmail: '', roleName: '' });
  };

  // Loading state
  if (loading && users.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>User Permissions Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  // Data state
  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>User Permissions Overview ({users.length})</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar user dan role yang telah diberikan
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Assigned Roles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                      Tidak ada data user ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium w-1/3">{user.email}</TableCell>
                      <TableCell className="w-2/3">
                        <div className="flex flex-wrap gap-2">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <div
                                key={role.id}
                                className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium border hover:bg-secondary/80 transition-colors"
                              >
                                <span>{role.name}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(user.id, role.id, user.email, role.name);
                                  }}
                                  disabled={loading}
                                  className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={`Hapus role ${role.name}`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm italic">
                              - No roles -
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <RoleDeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        userEmail={deleteModal.userEmail}
        roleName={deleteModal.roleName}
        isLoading={loading}
      />
    </>
  );
};