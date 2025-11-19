import { useState, useEffect } from "react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Patient } from "@/types/patients";
import { Badge } from "@/components/ui/badge";

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  patient: Patient | null;
  onUpdatePatient: (id: string, updates: Partial<Patient>) => void;
}

export const PatientDetailModal = ({ 
  isOpen, 
  onClose, 
  patient,
  onUpdatePatient 
}: PatientDetailModalProps) => {
  const [fullName, setFullName] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [gender, setGender] = useState("");
  const [metadataText, setMetadataText] = useState("");

  useEffect(() => {
    if (patient) {
      setFullName(patient.full_name || "");
      setTanggalLahir(patient.tanggal_lahir || "");
      setGender(patient.gender || "");
      setMetadataText(patient.metadata ? JSON.stringify(patient.metadata, null, 2) : "");
    }
  }, [patient]);

  if (!patient) return null;

  const handleSave = () => {
    let parsedMetadata = null;
    
    if (metadataText.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataText);
      } catch (error) {
        alert("Format metadata JSON tidak valid!");
        return;
      }
    }

    onUpdatePatient(patient.id, {
      full_name: fullName.trim() || null,
      tanggal_lahir: tanggalLahir || null,
      gender: gender || null,
      metadata: parsedMetadata
    });
    
    onClose(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isProfileComplete = patient.full_name && patient.tanggal_lahir && patient.gender;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detail & Edit Patient</DialogTitle>
          <DialogDescription>
            Update informasi pasien secara manual
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status Profil:</span>
            {isProfileComplete ? (
              <Badge className="bg-green-100 text-green-800">Profil Lengkap</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800">Profil Belum Lengkap</Badge>
            )}
          </div>

          {/* Read-Only Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
            <div>
              <Label className="text-xs text-muted-foreground">Patient ID</Label>
              <p className="text-xs font-mono bg-white p-2 rounded border mt-1 break-all">
                {patient.id}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">WhatsApp Number</Label>
              <p className="font-mono text-sm bg-white p-2 rounded border mt-1">
                {patient.whatsapp_number}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Terdaftar Pada</Label>
              <p className="text-sm bg-white p-2 rounded border mt-1">
                {formatDate(patient.created_at)}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Update</Label>
              <p className="text-sm bg-white p-2 rounded border mt-1">
                {formatDate(patient.updated_at)}
              </p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-semibold text-lg">Edit Informasi Pasien</h3>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap pasien"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                <Input
                  id="tanggalLahir"
                  type="date"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Pilih gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata (JSON Format)</Label>
              <Textarea
                id="metadata"
                value={metadataText}
                onChange={(e) => setMetadataText(e.target.value)}
                placeholder='{"alamat": "Jl. Contoh No. 123", "alergi": "Tidak ada"}'
                className="font-mono text-sm min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Format JSON untuk menyimpan informasi tambahan (opsional)
              </p>
            </div>
          </div>

          {/* Current Metadata Display */}
          {patient.metadata && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <Label className="text-sm font-medium mb-2 block">Metadata Saat Ini:</Label>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-[200px]">
                {JSON.stringify(patient.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onClose(false)}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};