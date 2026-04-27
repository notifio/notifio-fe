import { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';

import type { NotificationCategoryResponse } from '@notifio/api-client';

import { CATEGORY_GROUPS } from '../../lib/category-groups';
import { theme } from '../../lib/theme';
import { Card } from '../ui/card';
import { ToggleRow } from '../ui/toggle-row';

interface ResolvedGroup {
  groupKey: string;
  icon: typeof CATEGORY_GROUPS[number]['icon'];
  categories: NotificationCategoryResponse[];
}

interface NotificationCategoryListProps {
  /** API categories — provide for full hierarchical mode (settings) */
  categories?: NotificationCategoryResponse[];
  /** Group-level toggle values — provide for simplified mode (onboarding) */
  groupValues?: Record<string, boolean>;
  /** Called when an individual subcategory item is toggled (settings mode) */
  onToggleItem?: (categoryCode: string, subcategoryCode: string | null, enabled: boolean) => void;
  /** Called when a category-level toggle changes (settings mode) */
  onToggleCategory?: (categoryCode: string, enabled: boolean) => void;
  /** Called when a group-level toggle changes (both modes) */
  onToggleGroup: (groupKey: string, enabled: boolean) => void;
  /** Disable all toggles (e.g. while saving) */
  disabled?: boolean;
}

export function NotificationCategoryList({
  categories,
  groupValues,
  onToggleItem,
  onToggleCategory,
  onToggleGroup,
  disabled,
}: NotificationCategoryListProps) {
  const isFullMode = categories != null && categories.length > 0;

  if (isFullMode) {
    return (
      <FullModeList
        categories={categories}
        onToggleItem={onToggleItem}
        onToggleCategory={onToggleCategory}
        onToggleGroup={onToggleGroup}
        disabled={disabled}
      />
    );
  }

  // Group-only mode (onboarding)
  return (
    <View style={styles.container}>
      {CATEGORY_GROUPS.map((def) => (
        <Card key={def.groupKey}>
          <ToggleRow
            icon={def.icon}
            label={def.groupKey.charAt(0).toUpperCase() + def.groupKey.slice(1)}
            value={groupValues?.[def.groupKey] ?? true}
            onValueChange={(v) => onToggleGroup(def.groupKey, v)}
            disabled={disabled}
          />
        </Card>
      ))}
    </View>
  );
}

// ── Full hierarchical mode ────────────────────────────────────────────

interface FullModeProps {
  categories: NotificationCategoryResponse[];
  onToggleItem?: (categoryCode: string, subcategoryCode: string | null, enabled: boolean) => void;
  onToggleCategory?: (categoryCode: string, enabled: boolean) => void;
  onToggleGroup: (groupKey: string, enabled: boolean) => void;
  disabled?: boolean;
}

function FullModeList({ categories, onToggleItem, onToggleCategory, onToggleGroup, disabled }: FullModeProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(CATEGORY_GROUPS.map((g) => g.groupKey)));

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

  const handleGroupToggle = (group: ResolvedGroup, enabled: boolean) => {
    onToggleGroup(group.groupKey, enabled);
    if (onToggleCategory) {
      for (const cat of group.categories) {
        onToggleCategory(cat.categoryCode, enabled);
      }
    }
  };

  return (
    <View style={styles.container}>
      {groups.map((group) => {
        const allItems = group.categories.flatMap((c) => c.items);
        const someEnabled = allItems.some((i) => i.enabled);
        const isExpanded = expandedGroups.has(group.groupKey);

        return (
          <Card key={group.groupKey}>
            <Pressable onPress={() => toggleExpand(group.groupKey)}>
              <ToggleRow
                icon={group.icon}
                label={group.groupKey.charAt(0).toUpperCase() + group.groupKey.slice(1)}
                value={someEnabled}
                onValueChange={(v) => handleGroupToggle(group, v)}
                disabled={disabled}
              />
            </Pressable>

            {isExpanded && (
              <View>
                {group.categories.map((category) => (
                  <View key={category.categoryCode}>
                    {group.categories.length > 1 && (
                      <View style={styles.subcategoryRow}>
                        <ToggleRow
                          label={category.categoryName}
                          value={category.items.some((item) => item.enabled)}
                          onValueChange={(v) => onToggleCategory?.(category.categoryCode, v)}
                          disabled={disabled}
                        />
                      </View>
                    )}
                    {category.items.length > 1 && category.items.map((item) => (
                      <View key={item.preferenceId} style={styles.subsubRow}>
                        <ToggleRow
                          label={item.subcategoryCode ?? item.categoryCode}
                          value={item.enabled}
                          onValueChange={(v) => onToggleItem?.(item.categoryCode, item.subcategoryCode, v)}
                          disabled={disabled}
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </Card>
        );
      })}

      {ungrouped.map((category) => (
        <Card key={category.categoryCode}>
          <ToggleRow
            label={category.categoryName}
            value={category.items.some((item) => item.enabled)}
            onValueChange={(v) => onToggleCategory?.(category.categoryCode, v)}
            disabled={disabled}
          />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  subcategoryRow: {
    paddingLeft: theme.spacing.lg,
  },
  subsubRow: {
    paddingLeft: theme.spacing['2xl'],
  },
});
