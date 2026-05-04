import { IconX } from '@tabler/icons-react-native';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface FullScreenModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** iOS presentation style. Default 'pageSheet'. Android always renders fullscreen. */
  presentation?: 'pageSheet' | 'fullScreen';
  /** Sticky header-right slot (e.g. action button). Rendered to the left of the X close. */
  headerRight?: ReactNode;
  /** Header-left slot (e.g. leading icon). Rendered before the title. */
  headerLeft?: ReactNode;
  /** Sticky footer (e.g. Save button row). */
  footer?: ReactNode;
  /** Wraps children in a ScrollView. Default true. Set false when body has its own scroll/fills the space. */
  scrollable?: boolean;
  /** Wraps the modal in KeyboardAvoidingView. Default false (preserves prior behavior). */
  keyboardAvoiding?: boolean;
  children: ReactNode;
}

/**
 * Full-screen / page-sheet form modal:
 *   <Modal slide> + sticky header (title-LEFT + close X RIGHT) + body
 *   (optionally scrollable) + optional sticky footer.
 *
 * Body content is NOT auto-padded; callers manage their own internal
 * padding. KeyboardAvoidingView is opt-in (no current modal needs it).
 *
 * Out of scope: dismiss-confirm on dirty state, multi-step wizards.
 */
export function FullScreenModal({
  visible,
  onClose,
  title,
  presentation = 'pageSheet',
  headerLeft,
  headerRight,
  footer,
  scrollable = true,
  keyboardAvoiding = false,
  children,
}: FullScreenModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  // iOS pageSheet renders card-style with system gap above/below; iOS
  // fullScreen and all of Android (statusBarTranslucent set below) need
  // explicit insets so the header doesn't overlap the status bar/notch
  // and the footer clears the home indicator.
  const needsInsets = presentation === 'fullScreen' || Platform.OS === 'android';
  const headerPaddingTop = needsInsets ? insets.top + 12 : theme.spacing.lg;
  const footerPaddingBottom = needsInsets ? insets.bottom + 12 : theme.spacing.xl;

  const body = scrollable ? (
    <ScrollView
      style={styles.scrollBody}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.scrollBody}>{children}</View>
  );

  const content = (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: headerPaddingTop }]}>
        <View style={styles.headerLeft}>
          {headerLeft}
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {headerRight}
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <IconX size={24} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {body}

      {footer && (
        <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: footerPaddingBottom }]}>
          {footer}
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={presentation}
      onRequestClose={onClose}
      // statusBarTranslucent only meaningful on Android + non-pageSheet on iOS;
      // safe to set unconditionally and matches the prior modals.
      statusBarTranslucent
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    gap: theme.spacing.md,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minWidth: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    ...theme.font.semibold,
  },
  scrollBody: {
    flex: 1,
  },
  footer: {
    padding: theme.spacing.xl,
    borderTopWidth: 1,
  },
});
