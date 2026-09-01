import * as Haptics from 'expo-haptics';

export type HapticFeedbackType =
  | 'selection'
  | 'light'
  | 'medium'
  | 'success'
  | 'warning'
  | 'error';

export async function triggerHaptic(type: HapticFeedbackType = 'light'): Promise<void> {
  try {
    switch (type) {
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch {
    // Graceful silent fallback on unsupported environments (e.g. web/simulator)
  }
}
