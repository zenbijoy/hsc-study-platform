import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ensureRegisteredDevice } from '@/lib/devices';
import { downloadEncryptedPackage } from '@/lib/download';
import { requestBookLicense, unwrapLicense } from '@/lib/license';

export function ProtectedDownloadButton({ bookVersionId }: { bookVersionId?: string }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle'|'working'|'done'|'error'>('idle');
  const [message, setMessage] = useState('Download full-resolution encrypted book');

  const run = async () => {
    if (!bookVersionId) { setMessage('Publish a real book version in Supabase to enable'); return; }
    try {
      setStatus('working'); setMessage('Authorizing this device…');
      const deviceId = await ensureRegisteredDevice();
      if (!deviceId) throw new Error('Sign in before downloading protected content');
      const envelope = await requestBookLicense(bookVersionId, deviceId);
      await unwrapLicense(envelope);
      if (!envelope.deliveryUrl) throw new Error('No encrypted delivery URL is configured');
      setMessage('Downloading encrypted HSCP package…');
      await downloadEncryptedPackage(envelope.deliveryUrl, bookVersionId, setProgress);
      setStatus('done'); setMessage('Available offline inside this app'); setProgress(1);
    } catch (e: any) {
      setStatus('error'); setMessage(e?.message ?? 'Download failed');
    }
  };

  return (
    <View className="mt-3">
      <Pressable onPress={run} disabled={status === 'working'} className="flex-row items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-white/5 py-4">
        <Ionicons name={status === 'done' ? 'checkmark-circle' : 'cloud-download-outline'} size={19} color={status === 'error' ? '#FF8A76' : '#57E0B7'} />
        <Text className="text-sm font-bold text-white/80">{message}</Text>
      </Pressable>
      {status === 'working' && <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><View className="h-full rounded-full bg-mint" style={{ width: `${Math.max(progress * 100, 8)}%` }} /></View>}
    </View>
  );
}
