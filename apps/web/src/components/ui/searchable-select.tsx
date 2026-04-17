'use client';

import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface SearchableSelectGroup<T> {
  key: string;
  label: string;
  items: T[];
}

interface SearchableSelectProps<T> {
  value: T | null;
  onChange: (value: T) => void;
  options: T[];
  getLabel: (option: T) => string;
  getKey: (option: T) => string;
  groups?: SearchableSelectGroup<T>[];
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableSelect<T>({
  value,
  onChange,
  options,
  getLabel,
  getKey,
  groups,
  placeholder,
  disabled,
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedLabel = value ? getLabel(value) : null;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Scroll focused item into view
  useEffect(() => {
    if (!isOpen || focusedIdx < 0) return;
    const el = listRef.current?.querySelector(`[data-idx="${focusedIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusedIdx, isOpen]);

  const handleSelect = useCallback(
    (option: T) => {
      onChange(option);
      setIsOpen(false);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
          setFocusedIdx(0);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIdx((prev) => Math.min(prev + 1, options.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && focusedIdx >= 0 && focusedIdx < options.length) {
        e.preventDefault();
        handleSelect(options[focusedIdx]!);
      }
    },
    [isOpen, options, focusedIdx, handleSelect],
  );

  // Render grouped or flat
  const content = useMemo(() => {
    if (groups) {
      let globalIdx = 0;
      return groups.map((group) => (
        <div key={group.key}>
          <div className="sticky top-0 border-b border-border bg-card/80 px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted backdrop-blur-sm">
            {group.label}
          </div>
          {group.items.map((item) => {
            const idx = globalIdx++;
            const isSelected = value !== null && getKey(item) === getKey(value);
            const isFocused = focusedIdx === idx;
            return (
              <button
                key={getKey(item)}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-idx={idx}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setFocusedIdx(idx)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors',
                  isFocused && 'bg-card',
                  isSelected ? 'font-medium text-accent' : 'text-text-secondary',
                )}
              >
                <span className="flex-1 truncate">{getLabel(item)}</span>
                {isSelected && <IconCheck size={15} className="shrink-0 text-accent" />}
              </button>
            );
          })}
        </div>
      ));
    }

    return options.map((item, idx) => {
      const isSelected = value !== null && getKey(item) === getKey(value);
      const isFocused = focusedIdx === idx;
      return (
        <button
          key={getKey(item)}
          type="button"
          role="option"
          aria-selected={isSelected}
          data-idx={idx}
          onClick={() => handleSelect(item)}
          onMouseEnter={() => setFocusedIdx(idx)}
          className={cn(
            'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors',
            isFocused && 'bg-card',
            isSelected ? 'font-medium text-accent' : 'text-text-secondary',
          )}
        >
          <span className="flex-1 truncate">{getLabel(item)}</span>
          {isSelected && <IconCheck size={15} className="shrink-0 text-accent" />}
        </button>
      );
    });
  }, [groups, options, value, getKey, getLabel, focusedIdx, handleSelect]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl border px-4 text-left text-sm transition-colors',
          isOpen
            ? 'border-accent ring-1 ring-accent'
            : 'border-border hover:border-border/80',
          selectedLabel ? 'text-text-primary' : 'text-muted',
          disabled && 'opacity-50',
        )}
      >
        <span className="truncate">
          {selectedLabel ?? placeholder ?? ''}
        </span>
        <IconChevronDown
          size={16}
          className={cn(
            'shrink-0 text-muted transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute left-0 top-full z-10 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-background shadow-xl"
          role="listbox"
        >
          {content}
        </div>
      )}
    </div>
  );
}
