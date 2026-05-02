'use client';

import { IconCheck, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { hexToRgba } from '@/lib/color';
import { MAP_PIN_STYLES, SOURCE_REQUIRED_TIER } from '@/lib/map-pin-config';
import type { MapPinSource } from '@/lib/normalize-pins';

interface UpsellModalProps {
  source: MapPinSource | null;
  onClose: () => void;
}

/**
 * Step 8.5: shown when a FREE/PLUS user taps a greyed teaser pin or a
 * locked filter row. Source icon + title + tier pill, shared subtitle,
 * three orange-checkmark bullets explaining what unlocks, and a brand-
 * orange CTA routing to /pricing.
 */
export function UpsellModal({ source, onClose }: UpsellModalProps) {
  const t = useTranslations();
  if (!source) return null;
  const requiredTier = SOURCE_REQUIRED_TIER[source];
  if (requiredTier === 'FREE') return null;
  const style = MAP_PIN_STYLES[source];
  const Icon = style.icon;

  return (
    <div
      role="dialog"
      aria-modal
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '380px',
          width: '100%',
          background: '#162D4F',
          color: '#FFFFFF',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '24px',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '8px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <IconX size={16} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: hexToRgba(style.color, 0.16),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={22} color={style.color} strokeWidth={2.2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>
                {t(`upsell.sources.${source}.title`)}
              </h3>
              <TierBadgePill tier={requiredTier} />
            </div>
          </div>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#8B9BB5' }}>
          {t('upsell.subtitle')}
        </p>

        <div
          style={{
            background: 'rgba(0,0,0,0.16)',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginBottom: '20px',
          }}
        >
          {(['bullet1', 'bullet2', 'bullet3'] as const).map((key) => (
            <div
              key={key}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
            >
              <IconCheck
                size={14}
                strokeWidth={2.5}
                color="#FF7A2F"
                style={{ marginTop: '2px', flexShrink: 0 }}
              />
              <span style={{ fontSize: '12px', color: '#8B9BB5', lineHeight: 1.5 }}>
                {t(`upsell.sources.${source}.${key}`)}
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/pricing"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: '#FF7A2F',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          {t(`upsell.cta.${requiredTier}`)}
        </Link>
      </div>
    </div>
  );
}

function TierBadgePill({ tier }: { tier: 'PLUS' | 'PRO' }) {
  const color = tier === 'PRO' ? '#FF7A2F' : '#3A86FF';
  return (
    <span
      style={{
        backgroundColor: hexToRgba(color, 0.16),
        color,
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.05em',
      }}
    >
      {tier}
    </span>
  );
}
