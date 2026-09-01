import * as FileSystem from 'expo-file-system/legacy';
import { Directory, File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

type ProgressHandler = (ratio: number) => void;

export async function downloadEncryptedPackage(
  url: string,
  bookVersionId: string,
  onProgress?: ProgressHandler
) {
  const dir = new Directory(Paths.document, 'protected-books');
  if (!dir.exists) dir.create({ intermediates: true });
  const target = new File(dir, `${bookVersionId}.hscp`);
  if (target.exists && (target.size ?? 0) > 0) return target;

  const resumeKey = `hscp-resume:${bookVersionId}`;
  const savedResume = await SecureStore.getItemAsync(resumeKey);
  const resumable = FileSystem.createDownloadResumable(
    url,
    target.uri,
    {},
    (p) => onProgress?.(p.totalBytesExpectedToWrite ? p.totalBytesWritten / p.totalBytesExpectedToWrite : 0),
    savedResume || undefined
  );
  try {
    const result = await resumable.downloadAsync();
    if (!result?.uri) throw new Error('Download did not produce a file');
    await SecureStore.deleteItemAsync(resumeKey);
    return new File(result.uri);
  } catch (error) {
    try {
      const snapshot = await resumable.pauseAsync();
      if (snapshot.resumeData) await SecureStore.setItemAsync(resumeKey, snapshot.resumeData);
    } catch {}
    throw error;
  }
}

export function getDownloadedPackage(bookVersionId: string) {
  const file = new File(Paths.document, 'protected-books', `${bookVersionId}.hscp`);
  return file.exists ? file : null;
}
