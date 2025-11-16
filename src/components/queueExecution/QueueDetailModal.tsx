import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QueueItem } from "@/types/processQueue";
import { QueueStatusBadge } from "./QueueStatusBadge";
import { formatDateLong } from "@/utils/queueUtils";

interface QueueDetailModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  queueItem: QueueItem | null;
}

export const QueueDetailModal = ({ isOpen, onClose, queueItem }: QueueDetailModalProps) => {
  if (!queueItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail Queue Item</DialogTitle>
          <DialogDescription>Informasi lengkap dari item antrian</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Workflow</p>
              <p className="text-base font-semibold">{queueItem.workflow_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">
                <QueueStatusBadge status={queueItem.status} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Execution ID</p>
            <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
              {queueItem.execution_id}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dibuat Pada</p>
              <p className="text-sm">{formatDateLong(queueItem.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Diupdate Pada</p>
              <p className="text-sm">{formatDateLong(queueItem.updated_at)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};