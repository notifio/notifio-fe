import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RelativeTime } from '@/components/ui/relative-time';
import { ALERT_TYPE_CONFIG, type AlertSummary } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: AlertSummary;
  isSelected?: boolean;
  onClick?: () => void;
}

export function AlertCard({ alert, isSelected = false, onClick }: AlertCardProps) {
  const config = ALERT_TYPE_CONFIG[alert.type];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        'cursor-pointer p-4 transition-all',
        isSelected
          ? 'border-[#2563EB] ring-1 ring-[#2563EB]'
          : 'hover:border-gray-300',
      )}
    >
      <button onClick={onClick} className="flex w-full items-start gap-3 text-left">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: config.bgColor }}
        >
          <Icon size={18} color={config.color} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{alert.title}</p>
          <p className="mt-1 text-xs text-gray-500">
            {config.label} · {alert.source} · <RelativeTime iso={alert.startsAt} />
          </p>
        </div>

        <Badge variant={alert.severity} className="shrink-0">
          {alert.severity}
        </Badge>
      </button>
    </Card>
  );
}
