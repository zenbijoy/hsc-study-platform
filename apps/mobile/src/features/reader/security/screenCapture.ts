import * as ScreenCapture from 'expo-screen-capture';

export async function enableScreenCaptureProtection(tag: string = 'secure-reader'): Promise<void> {
  try {
    await ScreenCapture.preventScreenCaptureAsync(tag);
  } catch {
    // Graceful fallback on unsupported platforms / web
  }
}

export async function disableScreenCaptureProtection(tag: string = 'secure-reader'): Promise<void> {
  try {
    await ScreenCapture.allowScreenCaptureAsync(tag);
  } catch {
    // Graceful fallback
  }
}
