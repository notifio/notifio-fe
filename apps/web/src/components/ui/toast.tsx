'use client';

import { IconCheck, IconInfoCircle, IconX, IconAlertTriangle, IconExclamationCircle } from '@tabler/icons-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300',
  error: 'border-danger/30 bg-danger/10 text-danger',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  info: 'border-accent/30 bg-accent/10 text-accent',
};

const VARIANT_ICONS: Record<ToastVariant, typeof IconCheck> = {
  success: IconCheck,
  error: IconExclamationCircle,
  warning: IconAlertTriangle,
  info: IconInfoCircle,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast],
  );

  const ctx = useMemo<ToastContextValue>(
    () => ({
      toast: addToast,
      success: (m) => addToast(m, 'success'),
      error: (m) => addToast(m, 'error'),
      warning: (m) => addToast(m, 'warning'),
      info: (m) => addToast(m, 'info'),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
          {toasts.map((t) => {
            const Icon = VARIANT_ICONS[t.variant];
            return (
              <div
                key={t.id}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm',
                  'animate-in slide-in-from-right-5 fade-in duration-200',
                  VARIANT_STYLES[t.variant],
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1 text-sm font-medium">{t.message}</span>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
                >
                  <IconX size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
