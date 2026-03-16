import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { commonStyles } from '../../lib/common-styles';
import { theme } from '../../lib/theme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  header?: React.ReactNode;
}

export function ScreenLayout({ children, style, scrollable = false, header }: ScreenLayoutProps) {
  return (
    <SafeAreaView style={[commonStyles.screen, style]}>
      {header}
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={commonStyles.screenPadding}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.fill, commonStyles.screenPadding]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing['4xl'],
  },
});
