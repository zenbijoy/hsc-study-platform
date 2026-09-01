import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const act = async (mode: 'signin' | 'signup') => {
    setLoading(true); setMessage('');
    try {
      const result = mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      setMessage(mode === 'signup' && !result.data.session ? 'Check your email to confirm the account.' : 'Signed in successfully.');
      if (result.data.session) router.back();
    } catch (e: any) { setMessage(e?.message ?? 'Authentication failed'); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <View className="flex-1 justify-center">
        <Text className="text-xs font-bold uppercase tracking-[2px] text-mint">Secure student account</Text>
        <Text className="mt-3 text-4xl font-black text-white">Sign in</Text>
        <Text className="mt-3 text-sm leading-6 text-white/45">Authentication enables cross-device progress and device-bound protected-book licenses.</Text>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor="#60707C" className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white" />
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" placeholderTextColor="#60707C" className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white" />
        {!!message && <Text className="mt-4 text-sm text-white/60">{message}</Text>}
        <Pressable disabled={loading} onPress={() => act('signin')} className="mt-6 items-center rounded-2xl bg-mint py-4"><Text className="font-black text-ink">{loading ? 'Please wait…' : 'Sign in'}</Text></Pressable>
        <Pressable disabled={loading} onPress={() => act('signup')} className="mt-3 items-center rounded-2xl border border-white/10 py-4"><Text className="font-bold text-white/70">Create account</Text></Pressable>
      </View>
    </Screen>
  );
}
