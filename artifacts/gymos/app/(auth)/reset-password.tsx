import { useSignIn } from '@clerk/clerk-expo';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Field, LogoMark, PrimaryButton, ScreenScroll } from '@/components/GymUI';
import { useColors } from '@/hooks/useColors';

export default function ResetPasswordScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'password'>('request');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!isLoaded || busy) return;
    setBusy(true);
    try {
      if (step === 'request') {
        await signIn.create({ identifier: email.trim() });
        const emailFactor = signIn.supportedFirstFactors?.find(
          (factor) => factor.strategy === 'reset_password_email_code',
        );
        if (!emailFactor || !('emailAddressId' in emailFactor)) {
          throw new Error('Password reset by email is not enabled for this account.');
        }
        await signIn.prepareFirstFactor({ strategy: 'reset_password_email_code', emailAddressId: emailFactor.emailAddressId });
        setStep('verify');
      } else if (step === 'verify') {
        const result = await signIn.attemptFirstFactor({ strategy: 'reset_password_email_code', code });
        if (result.status === 'needs_new_password') setStep('password');
      } else {
        const result = await signIn.resetPassword({ password });
        if (result.status === 'complete') await setActive({ session: result.createdSessionId });
      }
    } catch (error) {
      Alert.alert('Unable to reset password', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <ScreenScroll style={styles.content}>
    <LogoMark /><Text style={[styles.title, { color: colors.foreground }]}>Reset password</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Recover access to your GymOS account.</Text>
    {step === 'request' ? <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /> : null}
    {step === 'verify' ? <Field label="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" /> : null}
    {step === 'password' ? <Field label="New password" value={password} onChangeText={setPassword} secureTextEntry /> : null}
    <PrimaryButton title={busy ? 'Please wait...' : step === 'request' ? 'Send reset code' : step === 'verify' ? 'Verify code' : 'Set new password'} onPress={submit} disabled={busy || (step === 'request' ? !email : step === 'verify' ? !code : !password)} />
    <PrimaryButton title="Back to sign in" onPress={() => router.replace('/sign-in')} secondary />
  </ScreenScroll>;
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 60 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, marginTop: 28 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 8, marginBottom: 36 },
});
