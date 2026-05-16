import { IconArrowsMaximize, IconX } from '@tabler/icons-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';

import type { RadarConfig } from '@notifio/api-client';
import { RADAR_PRECIPITATION_LEGEND } from '@notifio/shared';

import { buildRadarTileUrl } from '../../lib/radar-url';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

interface Props {
  config: RadarConfig;
  center: { lat: number; lng: number };
}

export function RadarMini({ config, center }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [showForecast, setShowForecast] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const tm = showForecast ? config.timestamps.forecastPlusOne : config.timestamps.now;
  const tileUrl = buildRadarTileUrl(config, config.defaultLayer, tm, API_KEY);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('radar.title')}</Text>
        <View style={[styles.toggle, { borderColor: colors.border }]}>
          <Pressable
            onPress={() => setShowForecast(false)}
            style={[
              styles.toggleBtn,
              !showForecast && { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[styles.toggleText, { color: !showForecast ? '#FFFFFF' : colors.textMuted }]}>
              {t('forecast.now')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setShowForecast(true)}
            style={[
              styles.toggleBtn,
              showForecast && { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[styles.toggleText, { color: showForecast ? '#FFFFFF' : colors.textMuted }]}>
              {t('radar.forecastPlusOne')}
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={() => setExpanded(true)} style={styles.mapWrap}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: center.lat,
            longitude: center.lng,
            latitudeDelta: 2,
            longitudeDelta: 2,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <UrlTile urlTemplate={tileUrl} maximumZ={config.bounds.maxZoom} opacity={0.7} />
        </MapView>
        <View style={styles.expandBadge}>
          <IconArrowsMaximize size={14} color={colors.text} />
        </View>
      </Pressable>

      <View style={styles.legend}>
        {RADAR_PRECIPITATION_LEGEND.map((stop) => (
          <View key={stop.label} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: stop.color }]} />
            <Text style={[styles.legendLabel, { color: colors.textMuted }]}>
              {t(`radar.legend.${stop.label}`)}
            </Text>
          </View>
        ))}
      </View>
      <Text style={[styles.attribution, { color: colors.textMuted }]}>{config.attribution}</Text>

      <Modal
        visible={expanded}
        animationType="slide"
        onRequestClose={() => setExpanded(false)}
      >
        <View style={[styles.overlay, { backgroundColor: colors.background }]}>
          <View style={[styles.overlayHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t('radar.title')}</Text>
            <Pressable onPress={() => setExpanded(false)} hitSlop={12}>
              <IconX size={22} color={colors.text} />
            </Pressable>
          </View>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: center.lat,
              longitude: center.lng,
              latitudeDelta: 2,
              longitudeDelta: 2,
            }}
          >
            <UrlTile urlTemplate={tileUrl} maximumZ={config.bounds.maxZoom} opacity={0.75} />
          </MapView>
          <Text style={[styles.attribution, { padding: theme.spacing.md, color: colors.textMuted }]}>
            {config.attribution}
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: theme.fontSize.md, ...theme.font.semibold },
  toggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  toggleText: { fontSize: 11, ...theme.font.medium },
  mapWrap: {
    height: 200,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  expandBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 4,
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendSwatch: {
    width: 14,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: { fontSize: 10 },
  attribution: { fontSize: 10 },
  overlay: { flex: 1 },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
  },
});
