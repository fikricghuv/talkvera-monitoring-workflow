// components/ragManagement/RagHeader.tsx
import { Database } from "lucide-react";

export const RagHeader = () => {
  return (
    <div className="flex items-center gap-3">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">
          Document Management Talkvera
        </h2>
        <p className="text-muted-foreground">
          Kelola dokumen dan URL untuk informasi customer
        </p>
      </div>
    </div>
  );
};