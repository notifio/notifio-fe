import { type ReactNode } from 'react';

interface PreferenceSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PreferenceSection({ title, description, children }: PreferenceSectionProps) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-4 space-y-1">{children}</div>
    </section>
  );
}
