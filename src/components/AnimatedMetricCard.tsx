import { useCountUp } from "@/hooks/useCountUp";

interface AnimatedMetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  borderColor: string;
  subtitle: React.ReactNode;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  useLocaleString?: boolean;
}

export const AnimatedMetricCard = ({ 
  title, 
  value, 
  icon, 
  borderColor, 
  subtitle, 
  decimals = 0, 
  prefix = '', 
  suffix = '',
  useLocaleString = false 
}: AnimatedMetricCardProps) => {
  const animatedValue = useCountUp(value, 2000, decimals, prefix, suffix, useLocaleString);

  return (
    <div className={`bg-white rounded-lg shadow-lg border-l-4 ${borderColor} p-6 hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{animatedValue}</div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
};