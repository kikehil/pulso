import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  trend,
  subtitle,
}: MetricCardProps) {
  return (
    <div className="metric-card group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="metric-label mb-2">{title}</p>
          <p className="metric-value group-hover:text-primary transition-colors">{value}</p>
          
          {subtitle && (
            <p className="text-xs text-gray mt-1 font-regular">{subtitle}</p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 mt-3">
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  trend.isPositive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-xs text-gray font-regular">vs mes anterior</span>
            </div>
          )}
        </div>

        <div className={cn('metric-icon shadow-lg', iconBgColor)}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </div>
  );
}

