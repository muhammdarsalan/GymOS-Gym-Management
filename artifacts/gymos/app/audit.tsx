import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGym } from '@/context/GymContext';
import { formatDate, formatTime } from '@/lib/gymos-data';
import { Header, ScreenScroll, EmptyState } from '@/components/GymUI';
import { useColors } from '@/hooks/useColors';

export default function Audit() {
  const colors = useColors(); const { data } = useGym();
  return <ScreenScroll><Header title="Audit history" subtitle="A traceable record of every change" />{data.auditLogs.length ? data.auditLogs.map((log) => <View key={log.id} style={styles.log}><View style={[styles.icon, { backgroundColor: colors.secondary }]}><Feather name="activity" size={15} color={colors.secondaryForeground} /></View><View style={{ flex: 1 }}><Text style={[styles.action, { color: colors.foreground }]}>{log.action}</Text><Text style={[styles.detail, { color: colors.mutedForeground }]}>{log.detail}</Text><Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(log.date, true)} at {formatTime(log.date)} · Owner</Text></View></View>) : <EmptyState icon="activity" title="No history yet" body="Important activity will be recorded automatically." />}</ScreenScroll>;
}
const styles = StyleSheet.create({ log: { flexDirection: 'row', gap: 11, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.15)' }, icon: { width: 33, height: 33, borderRadius: 11, justifyContent: 'center', alignItems: 'center' }, action: { fontFamily: 'Inter_700Bold', fontSize: 13 }, detail: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, marginTop: 4 }, date: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 5 } });