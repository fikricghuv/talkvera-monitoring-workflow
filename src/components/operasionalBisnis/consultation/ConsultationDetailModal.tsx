// components/consultation/ConsultationDetailModal.tsx

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ConsultationRequest } from "@/types/consultationRequests";
import { ConsultationStatusBadge } from "./ConsultationStatusBadge";
import { formatDateLong, getCompanySizeLabel, getDaysAgo } from "@/utils/consultationUtils";
import { 
  Mail, 
  Phone, 
  Building2, 
  Globe, 
  Users, 
  Calendar, 
  MessageSquare,
  Clock,
  Target
} from "lucide-react";

interface ConsultationDetailModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  request: ConsultationRequest | null;
  onUpdateStatus: (id: string, status: string) => void;
}

export const ConsultationDetailModal = ({ 
  isOpen, 
  onClose, 
  request,
  onUpdateStatus 
}: ConsultationDetailModalProps) => {
  const [newStatus, setNewStatus] = useState("");

  if (!request) return null;

  const handleUpdateStatus = () => {
    if (newStatus && newStatus !== request.consultation_status) {
      onUpdateStatus(request.id, newStatus);
      setNewStatus("");
      onClose(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detail Consultation Request</DialogTitle>
          <DialogDescription>
            Informasi lengkap permintaan konsultasi dan status email campaign
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 p-2 bg-gray-50 rounded-lg">
          {/* Contact Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-indigo-900 mb-3">
              {request.contact?.full_name || 'Unknown Contact'}
            </h2>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{request.contact?.email || '-'}</span>
              </div>
              
              {request.contact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{request.contact.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Informasi Perusahaan
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem 
                icon={<Building2 className="h-4 w-4 text-gray-500" />}
                title="Perusahaan" 
                value={<span className="font-medium">{request.contact?.company || '-'}</span>} 
              />
              <DetailItem 
                icon={<Users className="h-4 w-4 text-gray-500" />}
                title="Ukuran Perusahaan" 
                value={
                  <span className="bg-gray-200 px-3 py-1 rounded text-sm font-medium">
                    {getCompanySizeLabel(request.company_size)}
                  </span>
                } 
              />
              {request.website && (
                <DetailItem 
                  icon={<Globe className="h-4 w-4 text-gray-500" />}
                  title="Website" 
                  value={
                    <a 
                      href={request.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {request.website}
                    </a>
                  } 
                />
              )}
            </div>
          </div>

          {/* Consultation Description */}
          {request.describe_consultation && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Deskripsi Konsultasi
              </h3>
              <div className="bg-purple-50 p-4 rounded border border-purple-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {request.describe_consultation}
                </p>
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Status Saat Ini
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem 
                title="Consultation Status" 
                value={<ConsultationStatusBadge status={request.consultation_status} />} 
              />
              <DetailItem 
                title="Submitted" 
                value={
                  <div className="space-y-1">
                    <div className="text-sm">{formatDateLong(request.submitted_at)}</div>
                    <div className="text-xs text-muted-foreground">
                      {getDaysAgo(request.submitted_at)}
                    </div>
                  </div>
                } 
              />
            </div>
          </div>

          {/* Email Campaign Status */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600" />
              Status Email Campaign
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem 
                icon={<Mail className="h-4 w-4 text-gray-500" />}
                title="Greetings Email" 
                value={
                  request.greetings_email_sent_at ? (
                    <div className="space-y-1">
                      <div className="text-sm text-green-600 font-medium">✓ Terkirim</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateLong(request.greetings_email_sent_at)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Belum dikirim</span>
                  )
                } 
              />
              
              <DetailItem 
                icon={<Clock className="h-4 w-4 text-gray-500" />}
                title="Last Follow Up" 
                value={
                  request.last_follow_up_at ? (
                    <div className="space-y-1">
                      <div className="text-sm">{formatDateLong(request.last_follow_up_at)}</div>
                      <div className="text-xs text-muted-foreground">
                        {getDaysAgo(request.last_follow_up_at)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Belum ada follow up</span>
                  )
                } 
              />

              {request.replied_at && (
                <DetailItem 
                  icon={<MessageSquare className="h-4 w-4 text-gray-500" />}
                  title="Replied At" 
                  value={
                    <div className="space-y-1">
                      <div className="text-sm text-green-600 font-medium">✓ Dibalas</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateLong(request.replied_at)}
                      </div>
                    </div>
                  } 
                />
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-3">Update Status</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Status Baru
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status baru..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="greetings_sent">Greetings Sent</SelectItem>
                    <SelectItem value="follow_up_1_sent">Follow Up 1 Sent</SelectItem>
                    <SelectItem value="follow_up_2_sent">Follow Up 2 Sent</SelectItem>
                    <SelectItem value="follow_up_3_sent">Follow Up 3 Sent</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleUpdateStatus}
                disabled={!newStatus || newStatus === request.consultation_status}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update Status
              </Button>
            </div>
            {newStatus && newStatus === request.consultation_status && (
              <p className="text-xs text-amber-600 mt-2">
                Status yang dipilih sama dengan status saat ini
              </p>
            )}
          </div>

          {/* Technical Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <DetailItem 
              title="Request ID" 
              value={
                <span className="text-xs font-mono bg-gray-200 p-2 rounded truncate block select-all">
                  {request.id}
                </span>
              } 
            />
            <DetailItem 
              icon={<Calendar className="h-4 w-4 text-gray-500" />}
              title="Created At" 
              value={
                <span className="text-sm">
                  {formatDateLong(request.created_at)}
                </span>
              } 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DetailItem = ({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
      {icon}
      {title}
    </p>
    {value}
  </div>
);