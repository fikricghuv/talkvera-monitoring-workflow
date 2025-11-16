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
import { Appointment } from "@/types/appointments";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { formatAppointmentDateLong } from "@/utils/appointmentUtils";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  appointment: Appointment | null;
  onUpdateStatus: (id: string, newStatus: string) => void;
}

export const AppointmentDetailModal = ({ 
  isOpen, 
  onClose, 
  appointment,
  onUpdateStatus 
}: AppointmentDetailModalProps) => {
  const [newStatus, setNewStatus] = useState("");

  if (!appointment) return null;

  const handleUpdateStatus = () => {
    if (newStatus && newStatus !== appointment.status) {
      onUpdateStatus(appointment.id, newStatus);
      setNewStatus("");
      onClose(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detail Appointment</DialogTitle>
          <DialogDescription>
            Informasi lengkap dari appointment yang dipilih
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 p-2 bg-gray-50 rounded-lg">
          {/* Patient Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Informasi Pasien</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem 
                title="Nama Pasien" 
                value={
                  <span className="font-semibold text-lg text-indigo-700">
                    {appointment.patient?.full_name || 'Belum diisi'}
                  </span>
                } 
              />
              <DetailItem 
                title="WhatsApp" 
                value={
                  <span className="font-mono text-base">
                    {appointment.patient?.whatsapp_number || '-'}
                  </span>
                } 
              />
            </div>
          </div>

          {/* Appointment Details */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Detail Appointment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem 
                title="Tanggal & Waktu" 
                value={
                  <span className="font-medium text-blue-600">
                    {formatAppointmentDateLong(appointment.appointment_date_time)}
                  </span>
                } 
              />
              <DetailItem 
                title="Status Saat Ini" 
                value={<AppointmentStatusBadge status={appointment.status} />} 
              />
            </div>

            <div className="mt-4">
              <DetailItem 
                title="Alasan Kunjungan" 
                value={
                  <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                    {appointment.reason_for_visit || 'Tidak ada keterangan'}
                  </p>
                } 
              />
            </div>
          </div>

          {/* Technical Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Informasi Teknis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem 
                title="Google Calendar Event ID" 
                value={
                  <span className="text-xs font-mono bg-gray-200 p-2 rounded truncate block">
                    {appointment.google_calendar_event_id || 'Belum tersinkronisasi'}
                  </span>
                } 
              />
              <DetailItem 
                title="Booked Via Session ID" 
                value={
                  <span className="text-xs font-mono bg-gray-200 p-2 rounded truncate block">
                    {appointment.booked_via_session_id || '-'}
                  </span>
                } 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <DetailItem 
                title="Appointment ID" 
                value={
                  <span className="text-xs font-mono bg-gray-200 p-2 rounded truncate block select-all">
                    {appointment.id}
                  </span>
                } 
              />
              <DetailItem 
                title="Patient ID" 
                value={
                  <span className="text-xs font-mono bg-gray-200 p-2 rounded truncate block select-all">
                    {appointment.patient_id}
                  </span>
                } 
              />
            </div>
          </div>

          {/* Update Status Section */}
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
                    <SelectItem value="BOOKED">BOOKED</SelectItem>
                    <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    <SelectItem value="NO_SHOW">NO SHOW</SelectItem>
                    <SelectItem value="RESCHEDULED">RESCHEDULED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleUpdateStatus}
                disabled={!newStatus || newStatus === appointment.status}
                className="bg-green-600 hover:bg-green-700"
              >
                Update Status
              </Button>
            </div>
            {newStatus && newStatus === appointment.status && (
              <p className="text-xs text-amber-600 mt-2">
                Status yang dipilih sama dengan status saat ini
              </p>
            )}
          </div>

          {/* Timestamp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem 
              title="Dibuat Pada" 
              value={
                <span className="text-sm">
                  {formatAppointmentDateLong(appointment.created_at)}
                </span>
              } 
            />
            <DetailItem 
              title="Terakhir Diupdate" 
              value={
                <span className="text-sm">
                  {appointment.updated_at 
                    ? formatAppointmentDateLong(appointment.updated_at)
                    : '-'}
                </span>
              } 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DetailItem = ({ title, value }: { title: string; value: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-muted-foreground">{title}</p>
    {value}
  </div>
);