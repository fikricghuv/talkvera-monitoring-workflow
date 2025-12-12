import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
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
import { Appointment, AppointmentFormData } from "@/types/appointmentsTalkvera";

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  appointment?: Appointment | null;
  onSubmit: (data: AppointmentFormData) => Promise<boolean>;
  mode: 'create' | 'edit';
}

export const AppointmentFormModal = ({ 
  isOpen, 
  onClose, 
  appointment,
  onSubmit,
  mode
}: AppointmentFormModalProps) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    client_id: '',
    contact_id: '',
    appointment_start: '',
    appointment_end: '',
    reason: '',
    source: 'manual',
    status: 'scheduled',
    google_event_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && appointment) {
      setFormData({
        client_id: appointment.client_id || '',
        contact_id: appointment.contact_id || '',
        appointment_start: appointment.appointment_start?.slice(0, 16) || '',
        appointment_end: appointment.appointment_end?.slice(0, 16) || '',
        reason: appointment.reason || '',
        source: appointment.source,
        status: appointment.status,
        google_event_id: appointment.google_event_id || ''
      });
    } else {
      setFormData({
        client_id: '',
        contact_id: '',
        appointment_start: '',
        appointment_end: '',
        reason: '',
        source: 'manual',
        status: 'scheduled',
        google_event_id: ''
      });
    }
  }, [mode, appointment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData: AppointmentFormData = {
      ...formData,
      appointment_start: new Date(formData.appointment_start).toISOString(),
      appointment_end: formData.appointment_end 
        ? new Date(formData.appointment_end).toISOString() 
        : undefined,
      client_id: formData.client_id || undefined,
      contact_id: formData.contact_id || undefined,
      reason: formData.reason || undefined,
      google_event_id: formData.google_event_id || undefined
    };

    const success = await onSubmit(submitData);
    setIsSubmitting(false);
    
    if (success) {
      onClose(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === 'create' ? 'Buat Appointment Baru' : 'Edit Appointment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Isi form berikut untuk membuat appointment baru'
              : 'Update informasi appointment'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client ID */}
            <div className="space-y-2">
              <Label htmlFor="client_id">
                Client ID 
                <span className="text-xs text-muted-foreground ml-2">
                  (untuk membedakan data client)
                </span>
              </Label>
              <Input
                id="client_id"
                value={formData.client_id}
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                placeholder="UUID client (opsional)"
              />
            </div>

            {/* Contact ID */}
            <div className="space-y-2">
              <Label htmlFor="contact_id">
                Contact ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact_id"
                value={formData.contact_id}
                onChange={(e) => setFormData({...formData, contact_id: e.target.value})}
                placeholder="UUID contact dari CRM"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Waktu Mulai */}
            <div className="space-y-2">
              <Label htmlFor="appointment_start">
                Waktu Mulai <span className="text-red-500">*</span>
              </Label>
              <Input
                id="appointment_start"
                type="datetime-local"
                value={formData.appointment_start}
                onChange={(e) => setFormData({...formData, appointment_start: e.target.value})}
                required
              />
            </div>

            {/* Waktu Selesai */}
            <div className="space-y-2">
              <Label htmlFor="appointment_end">Waktu Selesai (Opsional)</Label>
              <Input
                id="appointment_end"
                type="datetime-local"
                value={formData.appointment_end}
                onChange={(e) => setFormData({...formData, appointment_end: e.target.value})}
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Catatan</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="Jelaskan tujuan atau catatan appointment..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">
                Source <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.source} 
                onValueChange={(value: any) => setFormData({...formData, source: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Terjadwal</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="canceled">Dibatalkan</SelectItem>
                  <SelectItem value="rescheduled">Dijadwal Ulang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Google Calendar Event ID */}
          <div className="space-y-2">
            <Label htmlFor="google_event_id">
              Google Calendar Event ID
              <span className="text-xs text-muted-foreground ml-2">
                (opsional, untuk sinkronisasi)
              </span>
            </Label>
            <Input
              id="google_event_id"
              value={formData.google_event_id}
              onChange={(e) => setFormData({...formData, google_event_id: e.target.value})}
              placeholder="ID event dari Google Calendar"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !formData.appointment_start || !formData.contact_id}
            >
              {isSubmitting 
                ? 'Menyimpan...' 
                : mode === 'create' ? 'Buat Appointment' : 'Update Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};