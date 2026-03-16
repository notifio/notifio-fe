import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SelectableOptionProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export function SelectableOption({ label, description, selected, onClick }: SelectableOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors',
        selected ? 'bg-[#EFF6FF]' : 'hover:bg-gray-50',
      )}
    >
      <div className="flex-1">
        <p className={cn('text-sm font-medium', selected ? 'text-[#2563EB]' : 'text-gray-900')}>
          {label}
        </p>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      {selected && <Check size={18} className="shrink-0 text-[#2563EB]" />}
    </button>
  );
}
