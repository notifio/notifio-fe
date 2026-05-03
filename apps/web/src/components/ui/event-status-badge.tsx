import { useTranslations } from 'next-intl';

/**
 * Event lifecycle status. Currently surfaced on map pins (where
 * `resolved` is filtered out before render — see normalize-pins) and
 * on event-detail pages (future, once shared EventDetail schema gains
 * the field — refactor doc item 14). The `resolved` branch in this
 * component is reachable today only via the future event-detail
 * surface; map pins will only ever pass `active` or `upcoming`.
 */
export type EventStatus = 'active' | 'upcoming' | 'resolved';

const STATUS_STYLES: Record<EventStatus, { bg: string; color: string }> = {
  active:   { bg: 'rgba(255,122,47,0.12)', color: '#FF7A2F' },
  upcoming: { bg: 'rgba(58,134,255,0.12)',  color: '#3A86FF' },
  resolved: { bg: 'rgba(139,155,181,0.10)', color: '#8B9BB5' },
};

interface EventStatusBadgeProps {
  status: EventStatus;
}

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const t = useTranslations();
  const style = STATUS_STYLES[status];
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        fontSize: '11px',
        fontWeight: 500,
        padding: '3px 8px',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
        display: 'inline-block',
        lineHeight: 1.2,
      }}
    >
      {t(`event.status.${status}`)}
    </span>
  );
}
