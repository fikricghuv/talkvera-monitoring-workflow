// components/roleManagement/RoleDeleteConfirmationModal.tsx

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RoleDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
  roleName: string;
  isLoading?: boolean;
}

/**
 * Modal konfirmasi untuk menghapus role dari user
 */
export const RoleDeleteConfirmationModal: React.FC<RoleDeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  roleName,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <DialogTitle>Hapus Role</DialogTitle>
              <DialogDescription className="mt-1">
                Tindakan ini tidak dapat dibatalkan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Apakah Anda yakin ingin menghapus role ini dari user?
          </p>
          
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-muted-foreground min-w-[60px]">User:</span>
              <span className="text-sm font-medium">{userEmail}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-muted-foreground min-w-[60px]">Role:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border">
                {roleName}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Menghapus...' : 'Hapus Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};