import { X } from 'lucide-react';

import { formatTimeAgo } from '@notifio/shared';

import { MAP_PIN_STYLES } from '@/lib/map-pin-config';
import type { MapPin } from '@/lib/normalize-pins';

interface MapPinPopupProps {
  pin: MapPin;
  onClose: () => void;
}

export function MapPinPopup({ pin, onClose }: MapPinPopupProps) {
  const style = MAP_PIN_STYLES[pin.source];

  return (
    <div className="w-[280px] rounded-xl bg-white p-3 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: style.color }}
          />
          <span className="text-sm font-medium text-gray-900 line-clamp-1">{pin.title}</span>
        </div>
        <button onClick={onClose} className="shrink-0 p-0.5 text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      </div>

      <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{pin.description}</p>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {pin.locality && <span>{pin.locality}</span>}
          <span>{formatTimeAgo(pin.timestamp)}</span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            pin.status === 'scheduled'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {pin.status === 'scheduled' ? 'Scheduled' : 'Active'}
        </span>
      </div>
    </div>
  );
}
