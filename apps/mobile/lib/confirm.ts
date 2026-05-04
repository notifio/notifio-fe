import type { TFunction } from 'i18next';
import { Alert } from 'react-native';

type ConfirmDestructiveArgs = {
  t: TFunction;
  titleKey: string;
  descKey?: string;
  confirmKey?: string;
  cancelKey?: string;
  onConfirm: () => void | Promise<unknown>;
};

/**
 * Show a destructive confirmation dialog with i18n labels.
 *
 * Enforces:
 *  - Cancel button is shown FIRST (iOS convention) with cancel style.
 *  - Confirm button has destructive style (red text on iOS).
 *  - Labels are i18n keys (no hardcoded strings).
 *
 * Pass `cancelKey`/`confirmKey` to override the defaults
 * (`common.cancel` / `common.delete`) when the action isn't a delete.
 */
export function confirmDestructive({
  t,
  titleKey,
  descKey,
  confirmKey = 'common.delete',
  cancelKey = 'common.cancel',
  onConfirm,
}: ConfirmDestructiveArgs) {
  Alert.alert(
    t(titleKey),
    descKey ? t(descKey) : undefined,
    [
      { text: t(cancelKey), style: 'cancel' },
      { text: t(confirmKey), style: 'destructive', onPress: () => { void onConfirm(); } },
    ],
  );
}
