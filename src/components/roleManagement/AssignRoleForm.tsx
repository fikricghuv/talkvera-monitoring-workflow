// components/roleManagement/AssignRoleForm.tsx

import React, { useMemo } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Role } from '../../types/roleManagement';

interface AssignRoleFormProps {
  users: User[];
  roles: Role[];
  selectedUser: string;
  selectedRole: string;
  loading: boolean;
  onUserChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onAssign: () => void;
}

/**
 * Form component untuk assign role ke user
 */
export const AssignRoleForm: React.FC<AssignRoleFormProps> = ({
  users,
  roles,
  selectedUser,
  selectedRole,
  loading,
  onUserChange,
  onRoleChange,
  onAssign,
}) => {
  // Filter user agar yang sudah punya role terpilih tidak muncul di dropdown
  const availableUsers = useMemo(() => {
    if (!selectedRole) return users;
    return users.filter(user => 
      !user.roles.some(r => r.id === selectedRole)
    );
  }, [users, selectedRole]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Assign Role ke User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Select User */}
          <Select value={selectedUser} onValueChange={onUserChange} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih User" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Select Role */}
          <Select value={selectedRole} onValueChange={onRoleChange} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name} {role.description && `- ${role.description}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Submit Button */}
          <Button 
            onClick={onAssign} 
            disabled={loading || !selectedUser || !selectedRole}
            className="w-full"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Assign Role
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};