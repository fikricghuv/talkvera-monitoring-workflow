// components/crm/CRMCreateModal.tsx

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CRMFormData } from "@/types/crmContacts";

interface CRMCreateModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onSubmit: (formData: CRMFormData) => void;
}

export const CRMCreateModal = ({ 
  isOpen, 
  onClose,
  onSubmit
}: CRMCreateModalProps) => {
  const [formData, setFormData] = useState<CRMFormData>({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    job_title: "",
    lifecycle_stage: "lead",
    lead_status: "new",
    lead_score: 0,
    first_source: "manual",
    notes: ""
  });

  const handleSubmit = () => {
    onSubmit(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      company: "",
      job_title: "",
      lifecycle_stage: "lead",
      lead_status: "new",
      lead_score: 0,
      first_source: "manual",
      notes: ""
    });
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onClose(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Tambah Kontak Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi kontak baru ke dalam sistem CRM
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Informasi Dasar</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nama Lengkap *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+62812xxxxxxxx"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(val: any) => setFormData({...formData, gender: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Informasi Profesional</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Perusahaan</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="PT Example Indonesia"
                />
              </div>
              <div>
                <Label htmlFor="job_title">Jabatan</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                  placeholder="CEO, Marketing Manager, dll"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Jakarta"
                />
              </div>
              <div>
                <Label htmlFor="country">Negara</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  placeholder="Indonesia"
                />
              </div>
            </div>
          </div>

          {/* CRM Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Status CRM</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="lifecycle_stage">Lifecycle Stage</Label>
                <Select 
                  value={formData.lifecycle_stage} 
                  onValueChange={(val: any) => setFormData({...formData, lifecycle_stage: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lead_status">Lead Status</Label>
                <Select 
                  value={formData.lead_status} 
                  onValueChange={(val: any) => setFormData({...formData, lead_status: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
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

              <div>
                <Label htmlFor="lead_score">Lead Score</Label>
                <Input
                  id="lead_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.lead_score}
                  onChange={(e) => setFormData({...formData, lead_score: parseInt(e.target.value) || 0})}
                  placeholder="0-100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="first_source">Source</Label>
              <Select 
                value={formData.first_source} 
                onValueChange={(val: any) => setFormData({...formData, first_source: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              placeholder="Tambahkan catatan atau informasi tambahan..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Batal
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.full_name || !formData.email}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Simpan Kontak
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};