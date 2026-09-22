import { useSignUp } from '@clerk/clerk-expo';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Field, LogoMark, PrimaryButton, ScreenScroll } from '@/components/GymUI';
import { useColors } from '@/hooks/useColors';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!isLoaded || busy) return;
    setBusy(true);
    try {
      if (!verificationPending) {
        await signUp.create({ emailAddress: email.trim(), password });
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setVerificationPending(true);
      } else {
        const result = await signUp.attemptEmailAddressVerification({ code });
        if (result.status === 'complete') await setActive({ session: result.createdSessionId });
      }
    } catch (error) {
      Alert.alert('Unable to create account', error instanceof Error ? error.message : 'Please review your details and try again.');
    } finally {
      setBusy(false);
    }
  };

  return <ScreenScroll style={styles.content}>
    <View style={styles.top}><LogoMark /><Text style={[styles.title, { color: colors.foreground }]}>{verificationPending ? 'Check your email' : 'Create your account'}</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{verificationPending ? 'Enter the verification code Clerk sent you.' : 'Start managing your gym with GymOS.'}</Text></View>
    {!verificationPending ? <><Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /><Field label="Password" value={password} onChangeText={setPassword} secureTextEntry /></> : <Field label="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" />}
    <PrimaryButton title={busy ? 'Please wait...' : verificationPending ? 'Verify email' : 'Create account'} onPress={submit} disabled={busy || (!verificationPending && (!email || !password)) || (verificationPending && !code)} />
    <Text style={[styles.switchText, { color: colors.mutedForeground }]}>Already have an account? <Text style={{ color: colors.secondaryForeground }} onPress={() => router.replace('/sign-in')}>Sign in</Text></Text>
  </ScreenScroll>;
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 60 },
  top: { marginBottom: 36 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, marginTop: 28 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 8 },
  switchText: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center', marginTop: 24 },
});
