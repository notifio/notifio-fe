import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';

import type { NotificationCategoryResponse } from '@notifio/api-client';

import { CATEGORY_GROUPS } from '../../lib/category-groups';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { Card } from '../ui/card';
import { ToggleRow } from '../ui/toggle-row';

/**
 * Sprint 2 (B3 split) Notifications-screen list.
 *
 * Each category card surfaces TWO toggles instead of one:
 *   • Show on map      — drives FE map pin visibility
 *   • Send notifications — drives BE push delivery
 * The two axes are orthogonal, matching Filip's product decision: a
 * user can keep traffic pins visible for situational awareness while
 * silencing push, and vice versa.
 *
 * Sub-category items still render with the dual toggles when a category
 * has more than one item (currently only `weather` does, per Filip's
 * call to skip per-subcategory UI for everything else).
 */
interface ResolvedGroup {
  groupKey: string;
  icon: typeof CATEGORY_GROUPS[number]['icon'];
  categories: NotificationCategoryResponse[];
}

interface NotificationPrefsListProps {
  categories: NotificationCategoryResponse[];
  onToggleSendNotifications: (categoryCode: string, subcategoryCode: string | null, value: boolean) => void;
  onToggleShowOnMap: (categoryCode: string, subcategoryCode: string | null, value: boolean) => void;
  onToggleCategorySend: (categoryCode: string, value: boolean) => void;
  onToggleCategoryShow: (categoryCode: string, value: boolean) => void;
  disabled?: boolean;
}

export function NotificationPrefsList({
  categories,
  onToggleSendNotifications,
  onToggleShowOnMap,
  onToggleCategorySend,
  onToggleCategoryShow,
  disabled,
}: NotificationPrefsListProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(CATEGORY_GROUPS.map((g) => g.groupKey)),
  );

  const toggleExpand = (groupKey: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  // Resolve groups from API categories
  const matched = new Set<string>();
  const groups: ResolvedGroup[] = [];

  for (const def of CATEGORY_GROUPS) {
    const cats = categories.filter((c) => def.categoryCodes.includes(c.categoryCode));
    if (cats.length === 0) continue;
    for (const c of cats) matched.add(c.categoryCode);
    groups.push({ groupKey: def.groupKey, icon: def.icon, categories: cats });
  }

  const ungrouped = categories.filter((c) => !matched.has(c.categoryCode));

  return (
    <View style={styles.container}>
      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group.groupKey);

        return (
          <Card key={group.groupKey}>
            <Pressable onPress={() => toggleExpand(group.groupKey)}>
              <View style={styles.groupHeader}>
                <Text style={[styles.groupTitle, { color: colors.text }]}>
                  {t(`categoryGroups.${group.groupKey}`)}
                </Text>
                <Text style={[styles.expandHint, { color: colors.textSecondary }]}>
                  {isExpanded ? '−' : '+'}
                </Text>
              </View>
            </Pressable>

            {isExpanded && (
              <View style={styles.groupBody}>
                {group.categories.map((category) => (
                  <CategoryCard
                    key={category.categoryCode}
                    category={category}
                    onToggleSend={(sub, v) => onToggleSendNotifications(category.categoryCode, sub, v)}
                    onToggleShow={(sub, v) => onToggleShowOnMap(category.categoryCode, sub, v)}
                    onToggleCategorySend={(v) => onToggleCategorySend(category.categoryCode, v)}
                    onToggleCategoryShow={(v) => onToggleCategoryShow(category.categoryCode, v)}
                    disabled={disabled}
                  />
                ))}
              </View>
            )}
          </Card>
        );
      })}

      {ungrouped.map((category) => (
        <Card key={category.categoryCode}>
          <CategoryCard
            category={category}
            onToggleSend={(sub, v) => onToggleSendNotifications(category.categoryCode, sub, v)}
            onToggleShow={(sub, v) => onToggleShowOnMap(category.categoryCode, sub, v)}
            onToggleCategorySend={(v) => onToggleCategorySend(category.categoryCode, v)}
            onToggleCategoryShow={(v) => onToggleCategoryShow(category.categoryCode, v)}
            disabled={disabled}
          />
        </Card>
      ))}
    </View>
  );
}

interface CategoryCardProps {
  category: NotificationCategoryResponse;
  onToggleSend: (subcategoryCode: string | null, value: boolean) => void;
  onToggleShow: (subcategoryCode: string | null, value: boolean) => void;
  onToggleCategorySend: (value: boolean) => void;
  onToggleCategoryShow: (value: boolean) => void;
  disabled?: boolean;
}

function CategoryCard({
  category,
  onToggleSend,
  onToggleShow,
  onToggleCategorySend,
  onToggleCategoryShow,
  disabled,
}: CategoryCardProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const sendOn = category.items.some((i) => i.sendNotifications);
  const showOn = category.items.some((i) => i.showOnMap);
  const hasSubcategories = category.items.length > 1;

  return (
    <View style={styles.category}>
      <Text style={[styles.categoryTitle, { color: colors.text }]}>{category.categoryName}</Text>
      <ToggleRow
        label={t('notificationPreferences.showOnMap')}
        value={showOn}
        onValueChange={onToggleCategoryShow}
        disabled={disabled}
      />
      <ToggleRow
        label={t('notificationPreferences.sendNotifications')}
        value={sendOn}
        onValueChange={onToggleCategorySend}
        disabled={disabled}
      />
      {hasSubcategories && (
        <View style={styles.subcategorySection}>
          <Text style={[styles.subcategoryLabel, { color: colors.textSecondary }]}>
            {t('notificationPreferences.perSubcategory')}
          </Text>
          {category.items.map((item) => (
            <View key={item.preferenceId} style={styles.subcategoryRow}>
              <Text style={[styles.subcategoryName, { color: colors.text }]}>
                {item.subcategoryCode ?? category.categoryName}
              </Text>
              <View style={styles.subToggles}>
                <ToggleRow
                  label={t('notificationPreferences.showOnMap')}
                  value={item.showOnMap}
                  onValueChange={(v) => onToggleShow(item.subcategoryCode, v)}
                  disabled={disabled}
                />
                <ToggleRow
                  label={t('notificationPreferences.sendNotifications')}
                  value={item.sendNotifications}
                  onValueChange={(v) => onToggleSend(item.subcategoryCode, v)}
                  disabled={disabled}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  groupTitle: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  expandHint: {
    fontSize: theme.fontSize.lg,
    ...theme.font.medium,
  },
  groupBody: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  category: {
    gap: theme.spacing.xs,
  },
  categoryTitle: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
    marginBottom: theme.spacing.xs,
  },
  subcategorySection: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
    paddingLeft: theme.spacing.lg,
  },
  subcategoryLabel: {
    fontSize: theme.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subcategoryRow: {
    gap: theme.spacing.xs,
  },
  subcategoryName: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  subToggles: {
    paddingLeft: theme.spacing.md,
  },
});
