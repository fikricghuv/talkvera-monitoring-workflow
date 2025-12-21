// components/consultation/ConsultationHeader.tsx

export const ConsultationHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">
          Consultation Request Monitoring
        </h2>
        <p className="text-muted-foreground">
          Monitor dan kelola semua permintaan konsultasi dan email campaign
        </p>
      </div>
    </div>
  );
};