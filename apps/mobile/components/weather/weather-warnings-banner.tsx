import { IconAlertTriangle, IconChevronDown, IconChevronUp } from '@tabler/icons-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';

import type { WeatherWarning, WeatherWarningSeverity } from '@notifio/api-client';

import { theme } from '../../lib/theme';

const SEVERITY_ORDER: Record<WeatherWarningSeverity, number> = {
  red: 3,
  orange: 2,
  yellow: 1,
};

const SEVERITY_GRADIENTS: Record<WeatherWarningSeverity, [string, string]> = {
  red: ['#DC2626', '#EF4444'],
  orange: ['#EA580C', '#F97316'],
  yellow: ['#D97706', '#F59E0B'],
};

const SEVERITY_TEXT: Record<WeatherWarningSeverity, string> = {
  red: '#FFFFFF',
  orange: '#FFFFFF',
  yellow: '#78350F',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

interface WeatherWarningsBannerProps {
  warnings: WeatherWarning[];
}

export function WeatherWarningsBanner({ warnings }: WeatherWarningsBannerProps) {
  

  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (warnings.length === 0) return null;

  const sorted = [...warnings].sort(
    (a, b) => (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0),
  );

  const top = sorted[0];
  if (!top) return null;

  const severity = top.severity as WeatherWarningSeverity;
  const textColor = SEVERITY_TEXT[severity] ?? SEVERITY_TEXT.yellow;
  const Chevron = expanded ? IconChevronUp : IconChevronDown;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <Pressable onPress={toggle}>
      <LinearGradient
        colors={SEVERITY_GRADIENTS[severity] ?? SEVERITY_GRADIENTS.yellow}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Collapsed row */}
        <View style={styles.row}>
          <IconAlertTriangle size={16} color={textColor} />
          <Text
            style={[styles.headline, { color: textColor }]}
            numberOfLines={expanded ? undefined : 1}
          >
            {top.headline}
          </Text>
          <Text style={[styles.time, { color: textColor }]}>
            {formatTime(top.validUntil)}
          </Text>
          {sorted.length > 1 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {sorted.length} {t('weatherWarnings.moreWarnings')}
              </Text>
            </View>
          )}
          <Chevron size={14} color={textColor} style={{ opacity: 0.6 }} />
        </View>

        {/* Expanded detail */}
        {expanded && (
          <View style={[styles.detail, { borderTopColor: `${textColor}26` }]}>
            {top.description ? (
              <Text style={[styles.description, { color: textColor }]}>
                {top.description}
              </Text>
            ) : null}
            <Text style={[styles.source, { color: textColor }]}>
              {top.provider} · {t('weatherWarnings.validUntil')} {formatTime(top.validUntil)}
            </Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headline: {
    flex: 1,
    fontSize: 13,
    ...theme.font.medium,
  },
  time: {
    fontSize: 12,
    opacity: 0.8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    ...theme.font.medium,
  },
  detail: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  description: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 18,
  },
  source: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 8,
  },
});
