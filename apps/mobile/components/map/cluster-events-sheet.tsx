import { IconChevronRight, IconX } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPinStyle } from '../../lib/map-pin-config';
import type { MapPin } from '../../lib/normalize-pins';
import { theme, withOpacity } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface ClusterEventsSheetProps {
  visible: boolean;
  events: MapPin[];
  onClose: () => void;
}

/**
 * Bottom sheet listing every event in a tapped cluster. Solves the
 * identical-coord stack problem (multiple events at the same lat/lng
 * are otherwise unreachable — only the top pin opens its callout).
 *
 * Tap row → close sheet → /events/{eventId}. Teasers are filtered
 * upstream so this sheet only ever sees real events with valid IDs.
 */
export function ClusterEventsSheet({ visible, events, onClose }: ClusterEventsSheetProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();

  const sheetBg = isDark ? '#162D4F' : '#FFFFFF';
  const sheetBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(14,34,63,0.08)';
  const handleColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(14,34,63,0.2)';
  const closeBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(14,34,63,0.06)';
  const headerBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(14,34,63,0.08)';
  const subtitleColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(14,34,63,0.55)';
  const chevronColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(14,34,63,0.3)';

  // All children at the exact same coord = "at this location";
  // mixed coords (rare with our radius) = "nearby".
  const first = events[0];
  const sameCoord =
    !!first && events.every((e) => e.lat === first.lat && e.lng === first.lng);

  const headerKey = sameCoord
    ? 'mapCluster.eventsAtLocation'
    : 'mapCluster.eventsNearby';

  const handleEventTap = (eventId: string) => {
    onClose();
    router.push(`/events/${eventId}`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: sheetBg, borderColor: sheetBorder }]}>
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          </View>

          <View style={[styles.header, { borderBottomColor: headerBorder }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {t(headerKey, { count: events.length })}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={[styles.closeButton, { backgroundColor: closeBg }]}
            >
              <IconX size={16} color={colors.text} />
            </Pressable>
          </View>

          <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {events.map((event) => {
                const style = getPinStyle(event);
                const Icon = style.icon;
                const subtitle = event.locality || event.description;

                return (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.row}
                    onPress={() => handleEventTap(event.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: withOpacity(style.color, 0.16) }]}>
                      <Icon size={18} color={style.color} strokeWidth={2.2} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
                        {event.title || t('mapCluster.untitledEvent')}
                      </Text>
                      {!!subtitle && (
                        <Text
                          style={[styles.rowSubtitle, { color: subtitleColor }]}
                          numberOfLines={1}
                        >
                          {subtitle}
                        </Text>
                      )}
                    </View>
                    <IconChevronRight size={16} color={chevronColor} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: '75%',
    minHeight: '40%',
  },
  handleWrap: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  safeArea: {
    flex: 1,
    minHeight: 0,
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  rowSubtitle: {
    fontSize: theme.fontSize.xs,
    marginTop: 2,
  },
});
