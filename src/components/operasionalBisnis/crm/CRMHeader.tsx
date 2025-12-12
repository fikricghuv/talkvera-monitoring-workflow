// components/crm/CRMHeader.tsx

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CRMHeaderProps {
  onCreateClick: () => void;
}

export const CRMHeader = ({ onCreateClick }: CRMHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">
          CRM Contact Management
        </h2>
        <p className="text-muted-foreground">
          Kelola dan monitor semua kontak customer Anda
        </p>
      </div>
      <Button 
        onClick={onCreateClick}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Tambah Kontak
      </Button>
    </div>
  );
};