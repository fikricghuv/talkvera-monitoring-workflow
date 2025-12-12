// components/crm/CRMDetailModal.tsx

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CRMContact } from "@/types/crmContacts";
import { CRMStatusBadge } from "./CRMStatusBadge";
import { formatDateLong, getSourceLabel } from "@/utils/crmUtils";
import { Mail, Phone, Building2, Briefcase, MapPin, Calendar, Target, TrendingUp, Edit2, Save, X } from "lucide-react";

interface CRMDetailModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  contact: CRMContact | null;
  onUpdateStatus: (id: string, updates: Partial<CRMContact>) => void;
}

export const CRMDetailModal = ({ 
  isOpen, 
  onClose, 
  contact,
  onUpdateStatus 
}: CRMDetailModalProps) => {
  const [newLifecycleStage, setNewLifecycleStage] = useState("");
  const [newLeadStatus, setNewLeadStatus] = useState("");
  
  // Edit states for phone and email
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedPhone, setEditedPhone] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  if (!contact) return null;

  const handleUpdateLifecycle = () => {
    if (newLifecycleStage && newLifecycleStage !== contact.lifecycle_stage) {
      onUpdateStatus(contact.id, { lifecycle_stage: newLifecycleStage as any });
      setNewLifecycleStage("");
      onClose(false);
    }
  };

  const handleUpdateLeadStatus = () => {
    if (newLeadStatus && newLeadStatus !== contact.lead_status) {
      onUpdateStatus(contact.id, { lead_status: newLeadStatus as any });
      setNewLeadStatus("");
      onClose(false);
    }
  };

  const handleStartEditPhone = () => {
    setEditedPhone(contact.phone || "");
    setIsEditingPhone(true);
  };

  const handleStartEditEmail = () => {
    setEditedEmail(contact.email || "");
    setIsEditingEmail(true);
  };

  const handleSavePhone = () => {
    if (editedPhone !== contact.phone) {
      onUpdateStatus(contact.id, { phone: editedPhone || null });
    }
    setIsEditingPhone(false);
  };

  const handleSaveEmail = () => {
    if (editedEmail && editedEmail !== contact.email) {
      onUpdateStatus(contact.id, { email: editedEmail });
    }
    setIsEditingEmail(false);
  };

  const handleCancelEditPhone = () => {
    setEditedPhone("");
    setIsEditingPhone(false);
  };

  const handleCancelEditEmail = () => {
    setEditedEmail("");
    setIsEditingEmail(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detail Kontak CRM</DialogTitle>
          <DialogDescription>
            Informasi lengkap dan status kontak
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 p-2 bg-gray-50 rounded-lg">
          {/* Contact Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-indigo-900 mb-3">{contact.full_name}</h2>
            
            <div className="space-y-3">
              {/* Email Section with Edit */}
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-600 flex-shrink-0" />
                {isEditingEmail ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="flex-1 h-8"
                      placeholder="email@example.com"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSaveEmail}
                      disabled={!editedEmail}
                      className="h-8 w-8 p-0"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCancelEditEmail}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-gray-700">{contact.email}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleStartEditEmail}
                      className="h-6 w-6 p-0 hover:bg-blue-100"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Phone Section with Edit */}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-600 flex-shrink-0" />
                {isEditingPhone ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="tel"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      className="flex-1 h-8"
                      placeholder="+62812xxxxxxxx"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSavePhone}
                      className="h-8 w-8 p-0"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCancelEditPhone}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-gray-700">
                      {contact.phone || (
                        <span className="text-gray-400 italic">Belum ada nomor telepon</span>
                      )}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleStartEditPhone}
                      className="h-6 w-6 p-0 hover:bg-blue-100"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          {(contact.company || contact.job_title) && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Informasi Profesional
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {contact.company && (
                  <DetailItem 
                    icon={<Building2 className="h-4 w-4 text-gray-500" />}
                    title="Perusahaan" 
                    value={<span className="font-medium">{contact.company}</span>} 
                  />
                )}
                {contact.job_title && (
                  <DetailItem 
                    icon={<Briefcase className="h-4 w-4 text-gray-500" />}
                    title="Jabatan" 
                    value={<span>{contact.job_title}</span>} 
                  />
                )}
              </div>
            </div>
          )}

          {/* Location Information */}
          {(contact.city || contact.country) && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Lokasi
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {contact.city && (
                  <DetailItem 
                    title="Kota" 
                    value={<span>{contact.city}</span>} 
                  />
                )}
                {contact.country && (
                  <DetailItem 
                    title="Negara" 
                    value={<span>{contact.country}</span>} 
                  />
                )}
              </div>
            </div>
          )}

          {/* CRM Status */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Status CRM
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <DetailItem 
                title="Lifecycle Stage" 
                value={<CRMStatusBadge status={contact.lifecycle_stage} type="lifecycle" />} 
              />
              <DetailItem 
                title="Lead Status" 
                value={<CRMStatusBadge status={contact.lead_status} type="lead" />} 
              />
              <DetailItem 
                title="Lead Score" 
                value={
                  <Badge variant="secondary" className="text-base font-bold">
                    {contact.lead_score}/100
                  </Badge>
                } 
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <DetailItem 
                title="Source" 
                value={
                  <span className="bg-gray-200 px-3 py-1 rounded text-sm font-medium">
                    {getSourceLabel(contact.first_source)}
                  </span>
                } 
              />
              {contact.gender && (
                <DetailItem 
                  title="Gender" 
                  value={
                    <span className="capitalize">{contact.gender}</span>
                  } 
                />
              )}
            </div>
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3">Catatan</h3>
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            </div>
          )}

          {/* Update Lifecycle Stage */}
          <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Update Lifecycle Stage
            </h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Stage Baru
                </label>
                <Select value={newLifecycleStage} onValueChange={setNewLifecycleStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lifecycle stage baru..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleUpdateLifecycle}
                disabled={!newLifecycleStage || newLifecycleStage === contact.lifecycle_stage}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Update Stage
              </Button>
            </div>
            {newLifecycleStage && newLifecycleStage === contact.lifecycle_stage && (
              <p className="text-xs text-amber-600 mt-2">
                Stage yang dipilih sama dengan stage saat ini
              </p>
            )}
          </div>

          {/* Update Lead Status */}
          <div className="bg-white p-4 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold mb-3">Update Lead Status</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Status Baru
                </label>
                <Select value={newLeadStatus} onValueChange={setNewLeadStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lead status baru..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleUpdateLeadStatus}
                disabled={!newLeadStatus || newLeadStatus === contact.lead_status}
                className="bg-green-600 hover:bg-green-700"
              >
                Update Status
              </Button>
            </div>
            {newLeadStatus && newLeadStatus === contact.lead_status && (
              <p className="text-xs text-amber-600 mt-2">
                Status yang dipilih sama dengan status saat ini
              </p>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <DetailItem 
              icon={<Calendar className="h-4 w-4 text-gray-500" />}
              title="First Seen" 
              value={
                <span className="text-sm">
                  {formatDateLong(contact.first_seen_at)}
                </span>
              } 
            />
            <DetailItem 
              icon={<Calendar className="h-4 w-4 text-gray-500" />}
              title="Last Interaction" 
              value={
                <span className="text-sm">
                  {formatDateLong(contact.last_interaction_at)}
                </span>
              } 
            />
          </div>

          {/* Technical Info */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <DetailItem 
              title="Contact ID" 
              value={
                <span className="text-xs font-mono bg-gray-200 p-2 rounded truncate block select-all">
                  {contact.id}
                </span>
              } 
            />
            <DetailItem 
              title="Created At" 
              value={
                <span className="text-sm">
                  {formatDateLong(contact.created_at)}
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