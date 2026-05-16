import { IconMoon, IconSunrise } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface Props {
  sunrise?: string;
  sunset?: string;
}

export function SunMoonCard({ sunrise, sunset }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  if (!sunrise && !sunset) return null;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('weatherPage.sunAndMoon')}</Text>
      <View style={styles.row}>
        {sunrise && (
          <View style={styles.col}>
            <IconSunrise size={20} color="#F59E0B" />
            <Text style={[styles.label, { color: colors.textMuted }]}>
              {t('weatherPage.sunrise')}
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>{fmt(sunrise)}</Text>
          </View>
        )}
        {sunset && (
          <View style={styles.col}>
            <IconMoon size={20} color="#60A5FA" />
            <Text style={[styles.label, { color: colors.textMuted }]}>
              {t('weatherPage.sunset')}
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>{fmt(sunset)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: { fontSize: theme.fontSize.md, ...theme.font.semibold },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  col: { alignItems: 'center', gap: 4 },
  label: { fontSize: theme.fontSize.xs },
  value: { fontSize: theme.fontSize.sm, ...theme.font.semibold },
});
