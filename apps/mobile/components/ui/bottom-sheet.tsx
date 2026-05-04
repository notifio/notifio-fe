import { IconX } from '@tabler/icons-react-native';
import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

type DimensionValue = number | `${number}%`;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Optional title — when set, primitive renders a header with title + close X. Omit for no header. */
  title?: string;
  /** Slot rendered to the right of the title in the header (e.g. count badge). Ignored when `title` is omitted. */
  headerRight?: ReactNode;
  /** Default: '80%'. */
  maxHeight?: DimensionValue;
  /** Optional minimum height. */
  minHeight?: DimensionValue;
  /** When true, primitive wraps children in SafeAreaView (bottom inset) + ScrollView. Default false. */
  scrollable?: boolean;
  /** Default true. */
  dismissOnBackdropPress?: boolean;
  children: ReactNode;
}

/**
 * Standard slide-up bottom sheet:
 *   <Modal transparent slide> + sibling backdrop + sheet container with
 *   visual drag handle (not actually draggable) and optional title-only
 *   header. Body content is NOT auto-padded — callers control their own
 *   internal padding.
 *
 * Sibling-backdrop pattern (not parent-Pressable) so internal ScrollViews
 * can claim the vertical-scroll responder without fighting the dismiss
 * Pressable.
 *
 * Out of scope: gesture-based dismiss, custom header layouts (use the
 * call site's own JSX above the children for those — omit `title`).
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  headerRight,
  maxHeight = '80%',
  minHeight,
  scrollable = false,
  dismissOnBackdropPress = true,
  children,
}: BottomSheetProps) {
  const { colors } = useAppTheme();

  const sheetStyle: ViewStyle = {
    backgroundColor: colors.sheet.bg,
    borderColor: colors.sheet.border,
    maxHeight,
    ...(minHeight !== undefined ? { minHeight } : null),
  };

  const body = scrollable ? (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  ) : (
    children
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.backdrop}
          onPress={dismissOnBackdropPress ? onClose : undefined}
        />

        <View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.sheet.handle }]} />
          </View>

          {title !== undefined && (
            <View style={[styles.header, { borderBottomColor: colors.sheet.border }]}>
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>
              <View style={styles.headerRight}>
                {headerRight}
                <Pressable
                  onPress={onClose}
                  hitSlop={8}
                  style={[styles.closeButton, { backgroundColor: colors.sheet.closeBg }]}
                >
                  <IconX size={16} color={colors.text} />
                </Pressable>
              </View>
            </View>
          )}

          {body}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    minHeight: 0,
  },
  scrollBody: {
    flex: 1,
  },
});
