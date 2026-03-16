import { Bell } from 'lucide-react';

import type { AlertSummary } from '@/lib/mock-data';

import { AlertCard } from './alert-card';

interface AlertListProps {
  alerts: AlertSummary[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function AlertList({ alerts, selectedId, onSelect }: AlertListProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Active alerts
          <span className="ml-1.5 text-gray-400">({alerts.length})</span>
        </h2>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16">
          <Bell size={32} className="text-gray-300" />
          <p className="text-sm text-gray-500">No active alerts in your area</p>
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              isSelected={selectedId === alert.id}
              onClick={() => onSelect?.(alert.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
