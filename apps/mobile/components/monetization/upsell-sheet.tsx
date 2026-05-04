import { IconCheck, IconX } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MAP_PIN_STYLES, SOURCE_REQUIRED_TIER } from '../../lib/map-pin-config';
import type { MapPinSource } from '../../lib/normalize-pins';
import { withOpacity } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';

interface UpsellSheetProps {
  source: MapPinSource | null;
  onClose: () => void;
}

/**
 * Step 8.5: shown when a FREE/PLUS user taps a greyed teaser pin or a
 * locked filter row. Mirrors web's `UpsellModal` redesign — source icon,
 * title + tier pill, three orange checkmarks, brand-orange CTA. CTA
 * shows the Coming Soon toast (IAP not wired yet).
 */
export function UpsellSheet({ source, onClose }: UpsellSheetProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  if (!source) return null;
  const requiredTier = SOURCE_REQUIRED_TIER[source];
  if (requiredTier === 'FREE') return null;
  const style = MAP_PIN_STYLES[source];
  const Icon = style.icon;

  const handleUpgrade = () => {
    showToast.info(t('common.comingSoon'), t('upsell.upgradeSoon'));
    onClose();
  };

  const subtitleColor = isDark ? '#8B9BB5' : 'rgba(14,34,63,0.6)';
  const bulletsBg = isDark ? 'rgba(0,0,0,0.16)' : 'rgba(14,34,63,0.04)';

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.sheet.bg, borderColor: colors.sheet.border }]}
          onPress={() => undefined}
        >
          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={[styles.closeBtn, { backgroundColor: colors.sheet.closeBg }]}
          >
            <IconX size={16} color={colors.text} />
          </Pressable>

          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: withOpacity(style.color, 0.16) }]}>
              <Icon size={22} color={style.color} strokeWidth={2.2} />
            </View>
            <View style={styles.titleColumn}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  {t(`upsell.sources.${source}.title`)}
                </Text>
                <TierBadgePill tier={requiredTier} />
              </View>
            </View>
          </View>

          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            {t('upsell.subtitle')}
          </Text>

          <View style={[styles.bulletsBox, { backgroundColor: bulletsBg }]}>
            {(['bullet1', 'bullet2', 'bullet3'] as const).map((key) => (
              <View key={key} style={styles.bulletRow}>
                <IconCheck size={14} strokeWidth={2.5} color="#FF7A2F" />
                <Text style={[styles.bulletText, { color: subtitleColor }]}>
                  {t(`upsell.sources.${source}.${key}`)}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleUpgrade}
            style={styles.cta}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaLabel}>{t(`upsell.cta.${requiredTier}`)}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TierBadgePill({ tier }: { tier: 'PLUS' | 'PRO' }) {
  const color = tier === 'PRO' ? '#FF7A2F' : '#3A86FF';
  return (
    <View
      style={{
        backgroundColor: withOpacity(color, 0.16),
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
      }}
    >
      <Text
        style={{
          color,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
        }}
      >
        {tier}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    paddingRight: 36,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  bulletsBox: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
    marginBottom: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  cta: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FF7A2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
