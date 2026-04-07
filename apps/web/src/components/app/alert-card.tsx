import type { AlertCategory, NotificationHistoryItem } from '@notifio/api-client';
import { CATEGORY_DISPLAY_NAMES } from '@notifio/shared';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RelativeTime } from '@/components/ui/relative-time';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  notification: NotificationHistoryItem;
  isSelected?: boolean;
  onClick?: () => void;
}

const SEVERITY_VARIANT: Record<string, 'info' | 'warning' | 'critical' | 'default'> = {
  info: 'info',
  warning: 'warning',
  critical: 'critical',
};

export function AlertCard({ notification, isSelected = false, onClick }: AlertCardProps) {
  const categoryNames = CATEGORY_DISPLAY_NAMES[notification.category as AlertCategory];
  const categoryLabel = categoryNames?.en ?? notification.category;
  const severityVariant = SEVERITY_VARIANT[notification.severity] ?? 'default';

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
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          {notification.body && (
            <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{notification.body}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {categoryLabel} · <RelativeTime iso={notification.createdAt} />
            {notification.status !== 'sent' && (
              <span className="ml-1 text-amber-600">· {notification.status}</span>
            )}
          </p>
        </div>

        <Badge variant={severityVariant} className="shrink-0">
          {notification.severity}
        </Badge>
      </button>
    </Card>
  );
}
