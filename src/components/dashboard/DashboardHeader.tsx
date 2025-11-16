import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  periodFilter: string;
  setPeriodFilter: (value: string) => void;
  customDates: { start: string; end: string };
  setCustomDates: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
  onRefresh: () => void;
}

export const DashboardHeader = ({
  periodFilter,
  setPeriodFilter,
  customDates,
  setCustomDates,
  onRefresh
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Ringkasan eksekusi workflow automation</p>
      </div>
      
      <div className="flex flex-wrap items-center justify-end gap-2">
        <select 
          value={periodFilter} 
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
        >
          <option value="7days">7 Hari Terakhir</option>
          <option value="30days">30 Hari Terakhir</option>
          <option value="3months">3 Bulan Terakhir</option>
          <option value="custom">Periode Custom</option>
        </select>
        
        <button 
          onClick={onRefresh}
          className="px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-accent hover:text-white transition-colors flex items-center gap-2 shadow-lg"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        
        {periodFilter === "custom" && (
          <div className="flex items-center gap-2 border-l pl-2">
            <input
              type="date"
              value={customDates.start}
              onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">s/d</span>
            <input
              type="date"
              value={customDates.end}
              onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};