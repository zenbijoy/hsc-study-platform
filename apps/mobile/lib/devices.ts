import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getDevicePublicKeyB64 } from './deviceKeys';
import { supabase, supabaseConfigured } from './supabase';

const DEVICE_ID_KEY = 'hsc_supabase_device_id_v1';

export async function ensureRegisteredDevice(): Promise<string | null> {
  if (!supabaseConfigured) return null;
  const { data: session } = await supabase.auth.getSession();
  const user = session.session?.user;
  if (!user) return null;
  const cached = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (cached) return cached;

  const publicKey = await getDevicePublicKeyB64();
  const { data: existing } = await supabase.from('devices').select('id').eq('user_id', user.id).eq('public_key_b64', publicKey).maybeSingle();
  if (existing?.id) {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, existing.id);
    return existing.id;
  }
  const { data, error } = await supabase.from('devices').insert({
    user_id: user.id,
    public_key_b64: publicKey,
    platform: Platform.OS,
    install_label: `${Platform.OS} app`,
  }).select('id').single();
  if (error) throw error;
  await SecureStore.setItemAsync(DEVICE_ID_KEY, data.id);
  return data.id;
}
