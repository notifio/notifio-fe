import { IconCheck, IconDownload } from '@tabler/icons-react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { useDataExport } from '../../hooks/use-data-export';
import { theme } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';

export default function DataExportScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { state, downloadUrl, error, requestExport } = useDataExport();

  const handleRequest = async () => {
    try {
      await requestExport();
    } catch {
      showToast.error(t('dataExport.error'));
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      Linking.openURL(downloadUrl);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('dataExport.title') }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {state === 'idle' && (
            <>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}18` }]}>
                <IconDownload size={28} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('dataExport.title')}
              </Text>
              <Text style={[styles.description, { color: colors.textMuted }]}>
                {t('dataExport.description')}
              </Text>
              <Pressable
                onPress={handleRequest}
                style={[styles.button, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.buttonText, { color: colors.textInverse }]}>
                  {t('dataExport.requestButton')}
                </Text>
              </Pressable>
              {error === 'timeout' && (
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {t('dataExport.timeout')}
                </Text>
              )}
              {error === 'failed' && (
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {t('dataExport.error')}
                </Text>
              )}
            </>
          )}

          {state === 'processing' && (
            <>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>
                {t('dataExport.preparing')}
              </Text>
              <Text style={[styles.description, { color: colors.textMuted }]}>
                {t('dataExport.preparingMessage')}
              </Text>
            </>
          )}

          {state === 'ready' && (
            <>
              <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}18` }]}>
                <IconCheck size={28} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('dataExport.complete')}
              </Text>
              <Pressable
                onPress={handleDownload}
                style={[styles.button, { backgroundColor: colors.primary }]}
              >
                <IconDownload size={18} color={colors.textInverse} />
                <Text style={[styles.buttonText, { color: colors.textInverse }]}>
                  {t('dataExport.downloadButton')}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSize.xl,
    ...theme.font.bold,
    textAlign: 'center',
  },
  description: {
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.xl,
  },
  buttonText: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
