import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGym } from '@/context/GymContext';
import { Header, ScreenScroll, EmptyState } from '@/components/GymUI';
import { formatDate } from '@/lib/gymos-data';
import { useColors } from '@/hooks/useColors';

export default function Notifications() {
  const colors = useColors(); const { data, markNotificationRead } = useGym();
  const iconFor = (type: string): keyof typeof Feather.glyphMap => type === 'payment' ? 'credit-card' : type === 'expiry' ? 'clock' : type === 'member' ? 'user-plus' : 'bell';
  return <ScreenScroll><Header title="Notifications" subtitle={`${data.notifications.filter((item) => !item.read).length} unread`} />{data.notifications.length ? data.notifications.map((note) => <Pressable key={note.id} onPress={() => { markNotificationRead(note.id); if (note.memberId) router.push({ pathname: '/member/[id]', params: { id: note.memberId } }); }} style={[styles.note, { backgroundColor: note.read ? colors.card : colors.secondary, borderColor: colors.border }]}><View style={[styles.icon, { backgroundColor: note.read ? colors.muted : colors.accent }]}><Feather name={iconFor(note.type)} size={17} color={colors.foreground} /></View><View style={{ flex: 1 }}><Text style={[styles.title, { color: colors.foreground }]}>{note.title}</Text><Text style={[styles.body, { color: colors.mutedForeground }]}>{note.body}</Text><Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(note.date, true)}</Text></View>{!note.read ? <View style={[styles.unread, { backgroundColor: colors.primary }]} /> : <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}</Pressable>) : <EmptyState icon="bell-off" title="No notifications" body="Important gym activity will show up here." />}</ScreenScroll>;
}
const styles = StyleSheet.create({ note: { borderWidth: 1, borderRadius: 17, padding: 13, flexDirection: 'row', gap: 11, marginBottom: 9 }, icon: { width: 38, height: 38, borderRadius: 13, justifyContent: 'center', alignItems: 'center' }, title: { fontFamily: 'Inter_700Bold', fontSize: 13 }, body: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, marginTop: 4 }, date: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 6 }, unread: { width: 7, height: 7, borderRadius: 4, marginTop: 5 } });