import { IconChevronRight, IconClock } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DigestPreferences } from '@notifio/api-client';
import { hexToRgba } from '@notifio/shared/alert-card';

import { useAppTheme } from '../../providers/theme-provider';

interface DigestBannerProps {
  digestPreferences: DigestPreferences;
}

const BLUE = '#3A86FF';

export function DigestBanner({ digestPreferences }: DigestBannerProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();

  if (!digestPreferences.morning && !digestPreferences.evening) return null;

  return (
    <Pressable
      onPress={() => router.push('/settings/digest')}
      style={[
        styles.banner,
        {
          backgroundColor: hexToRgba(BLUE, 0.1),
          borderColor: hexToRgba(BLUE, 0.25),
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: hexToRgba(BLUE, 0.2) }]}>
        <IconClock size={14} color={BLUE} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {t('overview.digestActive')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {t('overview.digestActiveSubtitle')}
        </Text>
      </View>
      <IconChevronRight size={13} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  subtitle: { fontSize: 10, marginTop: 1 },
});
