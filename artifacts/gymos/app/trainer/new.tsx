import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Field, Header, PrimaryButton, Screen } from '@/components/GymUI';
import { useGym } from '@/context/GymContext';
import { useColors } from '@/hooks/useColors';

export default function NewTrainer() {
  const colors = useColors(); const { addTrainer } = useGym(); const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [specialization, setSpecialization] = useState(''); const [notes, setNotes] = useState('');
  const save = () => { if (!name.trim() || !phone.trim()) { Alert.alert('Complete the profile', 'Add the trainer name and phone number.'); return; } addTrainer({ name: name.trim(), phone: phone.trim(), specialization: specialization.trim() || 'General fitness', notes }); router.back(); };
  return <Screen><Header title="Add trainer" subtitle="Build your coaching team" onBack={() => router.back()} /><KeyboardAwareScrollViewCompat contentContainerStyle={styles.content}><Text style={[styles.intro, { color: colors.mutedForeground }]}>Keep your trainer directory ready for member assignments and future coaching tools.</Text><Field label="Full name *" value={name} onChangeText={setName} placeholder="e.g. Omar Farooq" /><Field label="Phone *" value={phone} onChangeText={setPhone} placeholder="03xx xxxxxxx" keyboardType="phone-pad" /><Field label="Specialization" value={specialization} onChangeText={setSpecialization} placeholder="e.g. Strength & conditioning" /><Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Availability, certifications..." multiline style={styles.notes} /><PrimaryButton title="Save trainer" icon="check" onPress={save} /></KeyboardAwareScrollViewCompat></Screen>;
}
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 45 }, intro: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginBottom: 22 }, notes: { height: 90, paddingTop: 13, textAlignVertical: 'top' } });