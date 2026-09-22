import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Field, LogoMark, PrimaryButton, ScreenScroll } from '@/components/GymUI';
import { useColors } from '@/hooks/useColors';

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const signInWithPassword = async () => {
    if (!isLoaded || busy) return;
    setBusy(true);
    try {
      const result = await signIn.create({ identifier: email.trim(), password });
      if (result.status === 'complete') await setActive({ session: result.createdSessionId });
      else Alert.alert('Additional verification required', 'Complete the verification step in Clerk before continuing.');
    } catch (error) {
      Alert.alert('Unable to sign in', error instanceof Error ? error.message : 'Please check your details and try again.');
    } finally {
      setBusy(false);
    }
  };

  return <ScreenScroll style={styles.content}>
    <View style={styles.top}><LogoMark /><Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Sign in to manage your gym.</Text></View>
    <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
    <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
    <PrimaryButton title={busy ? 'Signing in...' : 'Sign in'} onPress={signInWithPassword} disabled={!email || !password || busy} />
    <PrimaryButton title="Forgot password?" onPress={() => router.push('/reset-password')} secondary />
    <Text style={[styles.switchText, { color: colors.mutedForeground }]}>New to GymOS? <Text style={{ color: colors.secondaryForeground }} onPress={() => router.push('/sign-up')}>Create an account</Text></Text>
  </ScreenScroll>;
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 60 },
  top: { marginBottom: 36 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, marginTop: 28 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 8 },
  switchText: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center', marginTop: 24 },
});
