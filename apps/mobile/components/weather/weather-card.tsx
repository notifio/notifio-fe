import type { Icon } from '@tabler/icons-react-native';
import {
  IconChevronRight,
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudStorm,
  IconDroplet,
  IconEye,
  IconMist,
  IconMoon,
  IconSnowflake,
  IconSun,
  IconTemperature,
  IconWind,
} from '@tabler/icons-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatRelativeTime, type RelativeTimeLocale } from '@notifio/shared/format';
import type { WeatherData } from '@notifio/shared/types';
import { formatTemp, formatVisibility, formatWind, getWeatherStyle } from '@notifio/shared/weather';

import { commonStyles } from '../../lib/common-styles';
import { theme, withOpacity } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const WEATHER_ICON_MAP: Record<string, Icon> = {
  Sun: IconSun,
  Cloud: IconCloud,
  CloudRain: IconCloudRain,
  CloudDrizzle: IconCloudRain,
  CloudLightning: IconCloudStorm,
  Snowflake: IconSnowflake,
  CloudFog: IconCloudFog,
  Haze: IconMist,
  Wind: IconWind,
  Thermometer: IconTemperature,
  Moon: IconMoon,
};

function getWeatherIcon(iconName: string): Icon {
  return WEATHER_ICON_MAP[iconName] ?? IconTemperature;
}

interface WeatherCardProps {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  locationLabel: string;
  onRetry?: () => void;
}

/**
 * Compact dashboard weather card. Tap to open the dedicated weather
 * page (`/weather`). AQI, pollen, forecast, pressure, sunrise/sunset,
 * radar — all moved to the weather page, not rendered here.
 */
export function WeatherCard({
  weather,
  isLoading,
  error,
  locationLabel,
  onRetry,
}: WeatherCardProps) {
  const { colors } = useAppTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const locale = i18n.language as RelativeTimeLocale;

  if (isLoading) {
    return <View style={[styles.skeleton, { backgroundColor: colors.surface }]} />;
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.severity.critical.bg }]}>
        <Text style={[styles.errorText, { color: colors.severity.critical.text }]}>{error}</Text>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            style={[styles.retryButton, { backgroundColor: colors.severity.critical.border }]}
          >
            <Text style={[styles.retryText, { color: colors.severity.critical.text }]}>
              {t('common.tryAgain')}
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (!weather) return null;

  const style = getWeatherStyle(weather.condition);
  const WeatherIcon = getWeatherIcon(style.iconName);

  const color80 = withOpacity(style.textColor, 0.8);
  const color70 = withOpacity(style.textColor, 0.7);
  const color60 = withOpacity(style.textColor, 0.6);
  const color40 = withOpacity(style.textColor, 0.4);

  return (
    <Pressable
      onPress={() => router.push('/weather')}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
    >
      <LinearGradient
        colors={style.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={commonStyles.rowBetween}>
          <View>
            <Text style={[styles.location, { color: color80 }]}>{locationLabel}</Text>
            <Text style={[styles.conditionLabel, { color: color60 }]}>
              {t(`weatherConditions.${weather.condition}`, { defaultValue: style.label })}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <WeatherIcon size={36} color={color70} />
            <IconChevronRight size={18} color={color60} />
          </View>
        </View>

        <View style={styles.tempContainer}>
          <Text style={[styles.temperature, { color: style.textColor }]}>
            {formatTemp(weather.temperature)}
          </Text>
          <Text style={[styles.feelsLike, { color: color70 }]}>
            {t('weather.feelsLike')} {formatTemp(weather.feelsLike)}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={commonStyles.row}>
            <IconWind size={14} color={color60} />
            <Text style={[styles.detailText, { color: color60 }]}>
              {formatWind(weather.windSpeed, weather.windDirection)}
            </Text>
          </View>
          <View style={commonStyles.row}>
            <IconDroplet size={14} color={color60} />
            <Text style={[styles.detailText, { color: color60 }]}>{weather.humidity}%</Text>
          </View>
          <View style={commonStyles.row}>
            <IconEye size={14} color={color60} />
            <Text style={[styles.detailText, { color: color60 }]}>
              {formatVisibility(weather.visibility)}
            </Text>
          </View>
        </View>

        <Text style={[styles.updatedAt, { color: color40 }]}>
          {formatRelativeTime(weather.updatedAt, locale)}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 200,
    borderRadius: theme.radius.xl,
  },
  errorContainer: {
    height: 200,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  retryText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  gradient: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  location: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  conditionLabel: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  tempContainer: {
    marginVertical: theme.spacing.lg,
  },
  temperature: {
    fontSize: 56,
    ...theme.font.bold,
  },
  feelsLike: {
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.xs,
  },
  updatedAt: {
    fontSize: theme.fontSize.xs,
    textAlign: 'right',
    marginTop: theme.spacing.md,
  },
});
