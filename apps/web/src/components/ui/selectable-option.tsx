import { IconCheck } from '@tabler/icons-react';

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
        selected ? 'bg-accent/10' : 'hover:bg-card',
      )}
    >
      <div className="flex-1">
        <p className={cn('text-sm font-medium', selected ? 'text-accent' : 'text-text-primary')}>
          {label}
        </p>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      {selected && <IconCheck size={18} className="shrink-0 text-accent" />}
    </button>
  );
}
