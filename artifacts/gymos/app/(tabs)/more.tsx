import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Header, LogoMark, ScreenScroll } from '@/components/GymUI';
import { useGym } from '@/context/GymContext';
import { useColors } from '@/hooks/useColors';

export default function MoreScreen() {
  const colors = useColors();
  const { data } = useGym();
  const items = [
    { icon: 'credit-card' as const, title: 'Payments', body: 'Receipts and transaction history', route: '/payments' },
    { icon: 'layers' as const, title: 'Membership plans', body: 'Manage pricing and durations', route: '/plans' },
    { icon: 'award' as const, title: 'Trainers', body: `${data.trainers.length} coaches on your team`, route: '/trainers' },
    { icon: 'bar-chart-2' as const, title: 'Reports', body: 'Revenue, members and attendance', route: '/reports' },
    { icon: 'bell' as const, title: 'Notifications', body: 'Alerts and recent updates', route: '/notifications' },
    { icon: 'settings' as const, title: 'Settings', body: 'Gym profile and preferences', route: '/settings' },
    { icon: 'activity' as const, title: 'Audit history', body: 'Every important change, traceable', route: '/audit' },
  ];
  return <ScreenScroll><View style={styles.brand}><LogoMark /><View style={{ flex: 1 }}><Text style={[styles.owner, { color: colors.foreground }]}>Owner / Receptionist</Text><Text style={[styles.gym, { color: colors.mutedForeground }]}>{data.settings.name}</Text></View><View style={[styles.online, { backgroundColor: colors.secondary }]}><View style={[styles.onlineDot, { backgroundColor: colors.secondaryForeground }]} /><Text style={[styles.onlineText, { color: colors.secondaryForeground }]}>Online</Text></View></View><Header title="More" subtitle="Manage every part of your gym" />{items.map((item) => <Pressable key={item.title} onPress={() => router.push(item.route as never)} style={({ pressed }) => [styles.item, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}><View style={[styles.itemIcon, { backgroundColor: colors.secondary }]}><Feather name={item.icon} size={18} color={colors.secondaryForeground} /></View><View style={{ flex: 1 }}><Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.itemBody, { color: colors.mutedForeground }]}>{item.body}</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable>)}</ScreenScroll>;
}
const styles = StyleSheet.create({ brand: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 6 }, owner: { fontFamily: 'Inter_600SemiBold', fontSize: 12 }, gym: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 }, online: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 15 }, onlineDot: { width: 6, height: 6, borderRadius: 3 }, onlineText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 }, item: { borderBottomWidth: 1, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, itemIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, itemTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 }, itemBody: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 } });