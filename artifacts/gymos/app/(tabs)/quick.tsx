import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Header, ScreenScroll } from '@/components/GymUI';
import { useColors } from '@/hooks/useColors';

export default function QuickScreen() {
  const colors = useColors();
  const actions = [
    { icon: 'user-plus' as const, title: 'Add member', body: 'Create a profile and membership', route: '/member/new' },
    { icon: 'credit-card' as const, title: 'Record payment', body: 'Capture a full membership payment', route: '/payment/new' },
    { icon: 'check-circle' as const, title: 'Manual check-in', body: 'Verify membership and record a visit', route: '/(tabs)/activity' },
    { icon: 'award' as const, title: 'Add trainer', body: 'Add a coach to the team', route: '/trainer/new' },
    { icon: 'search' as const, title: 'Search member', body: 'Find a profile, receipt or ID', route: '/(tabs)/members' },
  ];
  return <ScreenScroll><Header title="Quick action" subtitle="What do you need to do?" /><Text style={[styles.helper, { color: colors.mutedForeground }]}>The fastest path to the tasks you do most at the front desk.</Text>{actions.map((action, index) => <Pressable key={action.title} onPress={() => router.push(action.route as never)} style={({ pressed }) => [styles.action, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.76 : 1 }]}><View style={[styles.icon, { backgroundColor: index === 0 ? colors.accent : colors.secondary }]}><Feather name={action.icon} size={20} color={colors.foreground} /></View><View style={{ flex: 1 }}><Text style={[styles.title, { color: colors.foreground }]}>{action.title}</Text><Text style={[styles.body, { color: colors.mutedForeground }]}>{action.body}</Text></View><Feather name="arrow-up-right" size={18} color={colors.mutedForeground} /></Pressable>)}</ScreenScroll>;
}
const styles = StyleSheet.create({ helper: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginBottom: 21 }, action: { borderWidth: 1, borderRadius: 19, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 10 }, icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, title: { fontFamily: 'Inter_700Bold', fontSize: 14 }, body: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 } });