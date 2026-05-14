import {
  IconBell,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconExternalLink,
  IconFileDescription,
  IconHeart,
  IconMail,
  IconShield,
} from '@tabler/icons-react-native';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SOURCE_ADAPTERS } from '@notifio/shared/constants';

import { SPACING } from '../../lib/spacing';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://notifio.app';
const SUPPORT_EMAIL = 'support@notifio.sk';

const FAQ_KEYS = [
  'noNotifications',
  'planDifference',
  'addLocation',
  'digestModes',
  'muteLocation',
  'communityReliability',
  'cancelSubscription',
  'deleteAccount',
] as const;

const SOURCE_NAMES = Object.values(SOURCE_ADAPTERS)
  .map((s) => s.name)
  .sort((a, b) => a.localeCompare(b))
  .join(' · ');

function getVersionInfo() {
  const cfg = Constants.expoConfig;
  const version = cfg?.version ?? '0.0.0';
  const buildNumber =
    Platform.OS === 'ios'
      ? cfg?.ios?.buildNumber ?? '—'
      : cfg?.android?.versionCode?.toString() ?? '—';
  return { version, buildNumber };
}

export default function AboutScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { version, buildNumber } = getVersionInfo();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // TODO: confirm web /privacy and /terms routes exist before public launch
  const openPrivacy = () => void Linking.openURL(`${WEB_URL}/privacy`);
  const openTerms = () => void Linking.openURL(`${WEB_URL}/terms`);
  const openSupport = () =>
    void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Notifio Support`);

  return (
    <>
      <Stack.Screen options={{ title: t('settings.about') }} />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.brandSquare, { backgroundColor: colors.primary }]}>
            <IconBell size={32} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <Text style={[styles.brandName, { color: colors.text }]}>Notifio</Text>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            {t('about.tagline')}
          </Text>
        </View>

        {/* Version card */}
        <View style={[styles.versionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.versionLeft}>
            <Text style={[styles.versionLabel, { color: colors.text }]}>{t('about.version')}</Text>
            <Text style={[styles.buildLine, { color: colors.textMuted }]}>
              {t('about.build', { build: buildNumber })}
            </Text>
          </View>
          <Text style={[styles.versionValue, { color: colors.primary }]}>{version}</Text>
        </View>

        {/* FAQ */}
        <SectionHeading label={t('about.faq.section')} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {FAQ_KEYS.map((key, index) => {
            const isExpanded = expandedFaq === key;
            return (
              <View key={key}>
                {index > 0 && <Divider />}
                <Pressable
                  onPress={() => setExpandedFaq(isExpanded ? null : key)}
                  style={({ pressed }) => [styles.faqRow, pressed && styles.rowPressed]}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isExpanded }}
                >
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqQuestion, { color: colors.text }]}>
                      {t(`about.faq.items.${key}.q`)}
                    </Text>
                    {isExpanded ? (
                      <IconChevronUp size={16} color={colors.primary} />
                    ) : (
                      <IconChevronDown size={16} color={colors.textMuted} />
                    )}
                  </View>
                  {isExpanded && (
                    <Text style={[styles.faqAnswer, { color: colors.textMuted }]}>
                      {t(`about.faq.items.${key}.a`)}
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Legal */}
        <SectionHeading label={t('about.legal.section')} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <LinkRow
            icon={IconShield}
            label={t('about.legal.privacy')}
            external
            onPress={openPrivacy}
          />
          <Divider />
          <LinkRow
            icon={IconFileDescription}
            label={t('about.legal.terms')}
            external
            onPress={openTerms}
          />
        </View>

        {/* Support */}
        <SectionHeading label={t('about.support.section')} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <LinkRow
            icon={IconMail}
            label={t('about.support.contact')}
            onPress={openSupport}
          />
          <Text style={[styles.supportResponseTime, { color: colors.textMuted }]}>
            {t('about.support.responseTime')}
          </Text>
        </View>

        {/* Data sources */}
        {/* TODO: Audit each data source's ToS for required attribution wording before public launch.
            Some providers (MeteoAlarm, government data sources) may require specific attribution text.
            For now: list provider names without specific attribution claims.
            Reference: data sources known to be in use per project memory:
            - SHMÚ (Slovak Hydrometeorological Institute)
            - MeteoAlarm
            - OpenWeatherMap
            - Open-Meteo
            - Google Maps (traffic)
            - TomTom (Vector Flow Tiles)
            - ZSE / SSE / VSE / VypadokElektriny (electricity outages)
            - BVS (water)
            - SPP (gas)
            - Veolia (heat)
            - Nominatim (geocoding) */}
        <SectionHeading label={t('about.dataSources.section')} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: theme.spacing.lg, gap: theme.spacing.sm }]}>
          <Text style={[styles.dsIntro, { color: colors.textMuted }]}>
            {t('about.dataSources.intro')}
          </Text>
          <Text style={[styles.dsProviders, { color: colors.text }]}>
            {SOURCE_NAMES}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.madeInRow}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {t('about.madeIn.before')}
            </Text>
            <IconHeart size={12} color={colors.primary} fill={colors.primary} />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {t('about.madeIn.after')}
            </Text>
          </View>
          <Text style={[styles.footerText, { color: colors.textMuted, marginTop: 4 }]}>
            {t('about.copyright')}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function SectionHeading({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>{label}</Text>
  );
}

function Divider() {
  const { colors } = useAppTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

interface LinkRowProps {
  icon: typeof IconShield;
  label: string;
  external?: boolean;
  onPress: () => void;
}

function LinkRow({ icon: Icon, label, external, onPress }: LinkRowProps) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Icon size={18} color={colors.textMuted} />
      <Text style={[styles.rowLabel, { color: colors.text }]} numberOfLines={1}>
        {label}
      </Text>
      {external ? (
        <IconExternalLink size={16} color={colors.textMuted} />
      ) : (
        <IconChevronRight size={16} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.screenH,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing['4xl'],
  },
  hero: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing['2xl'],
  },
  brandSquare: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    marginTop: theme.spacing.sm,
    fontSize: 22,
    ...theme.font.bold,
  },
  tagline: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  versionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
  },
  versionLeft: {
    gap: 2,
  },
  versionLabel: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  buildLine: {
    fontSize: theme.fontSize.xs,
  },
  versionValue: {
    fontSize: theme.fontSize.lg,
    ...theme.font.bold,
    fontVariant: ['tabular-nums'],
  },
  sectionHeading: {
    marginTop: theme.spacing['2xl'],
    marginBottom: theme.spacing.sm,
    fontSize: theme.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...theme.font.semibold,
  },
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowLabel: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  faqRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  faqAnswer: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.xs,
    lineHeight: 18,
  },
  supportResponseTime: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    fontSize: theme.fontSize.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: theme.spacing.lg + 18 + theme.spacing.md,
  },
  dsIntro: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  dsProviders: {
    fontSize: theme.fontSize.sm,
    lineHeight: 22,
  },
  footer: {
    marginTop: theme.spacing['3xl'],
    alignItems: 'center',
  },
  madeInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: theme.fontSize.xs,
  },
});
