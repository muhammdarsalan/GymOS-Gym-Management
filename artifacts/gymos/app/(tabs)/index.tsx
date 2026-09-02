import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useGym } from '@/context/GymContext';
import { formatDate, formatRs, memberStatus } from '@/lib/gymos-data';
import { Header, LogoMark, MemberAvatar, PrimaryButton, ScreenScroll, SectionTitle, StatCard, StatusPill } from '@/components/GymUI';

export default function Dashboard() {
  const colors = useColors();
  const { data } = useGym();
  const active = data.members.filter((member) => memberStatus(member) === 'Active').length;
  const expiring = data.members.filter((member) => memberStatus(member) === 'Expiring Soon').length;
  const revenue = data.payments.filter((payment) => payment.status === 'completed' && new Date(payment.date).toDateString() === new Date().toDateString()).reduce((sum, payment) => sum + payment.amount, 0);
  const monthRevenue = data.payments.filter((payment) => payment.status === 'completed' && new Date(payment.date).getMonth() === new Date().getMonth()).reduce((sum, payment) => sum + payment.amount, 0);
  const todayAttendance = data.attendance.filter((item) => new Date(item.checkIn).toDateString() === new Date().toDateString()).length;
  const recentMembers = data.members.filter((member) => !member.archived).slice(0, 4);
  return <ScreenScroll>
    <View style={styles.topLine}><LogoMark /><Pressable onPress={() => router.push('/notifications')} style={[styles.bell, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="bell" size={19} color={colors.foreground} />{data.notifications.some((item) => !item.read) ? <View style={[styles.dot, { backgroundColor: colors.accent }]} /> : null}</Pressable></View>
    <Header title={`Good morning, Owner`} subtitle={`${data.settings.name} · Wednesday, ${new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long' })}`} />
    <View style={[styles.hero, { backgroundColor: colors.primary }]}><View style={styles.heroCopy}><Text style={[styles.eyebrow, { color: colors.accent }]}>TODAY AT A GLANCE</Text><Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>Keep the floor moving.</Text><Text style={[styles.heroBody, { color: '#B9C6BC' }]}>{todayAttendance} check-ins so far · {expiring} memberships need attention</Text></View><View style={[styles.heroOrb, { backgroundColor: colors.accent }]}><Feather name="trending-up" size={25} color={colors.foreground} /></View></View>
    <View style={styles.statsGrid}><View style={styles.statColumn}><StatCard label="Total members" value={data.members.filter((m) => !m.archived).length} icon="users" onPress={() => router.push('/members')} /><StatCard label="Today’s revenue" value={formatRs(revenue)} icon="credit-card" /></View><View style={styles.statColumn}><StatCard label="Active members" value={active} icon="zap" accent /><StatCard label="This month" value={formatRs(monthRevenue)} icon="bar-chart-2" onPress={() => router.push('/reports')} /></View></View>
    <SectionTitle title="Quick actions" />
    <View style={styles.actionGrid}><QuickAction icon="user-plus" label="Add member" onPress={() => router.push('/member/new')} /><QuickAction icon="credit-card" label="Record payment" onPress={() => router.push('/payment/new')} /><QuickAction icon="check-circle" label="Check in" onPress={() => router.push('/(tabs)/activity')} /><QuickAction icon="search" label="Find member" onPress={() => router.push('/(tabs)/members')} /></View>
    <SectionTitle title="Needs attention" action={expiring ? 'View all' : undefined} onAction={() => router.push('/members')} />
    {expiring ? data.members.filter((member) => memberStatus(member) === 'Expiring Soon').slice(0, 2).map((member) => <Pressable key={member.id} onPress={() => router.push({ pathname: '/member/[id]', params: { id: member.id } })} style={[styles.alertRow, { backgroundColor: '#FFF8E8', borderColor: '#F4DFB0' }]}><View style={[styles.alertIcon, { backgroundColor: '#F6D98F' }]}><Feather name="clock" size={17} color="#8B631B" /></View><View style={{ flex: 1 }}><Text style={[styles.alertTitle, { color: colors.foreground }]}>{member.name}</Text><Text style={[styles.alertText, { color: '#8B631B' }]}>Membership expires {member.membership ? formatDate(member.membership.endDate) : 'soon'}</Text></View><Feather name="chevron-right" size={17} color="#8B631B" /></Pressable>) : <View style={[styles.clearRow, { backgroundColor: colors.secondary }]}><Feather name="check" size={17} color={colors.secondaryForeground} /><Text style={[styles.clearText, { color: colors.secondaryForeground }]}>You’re all caught up today.</Text></View>}
    <SectionTitle title="Recent members" action="View all" onAction={() => router.push('/(tabs)/members')} />
    {recentMembers.map((member) => <Pressable key={member.id} onPress={() => router.push({ pathname: '/member/[id]', params: { id: member.id } })} style={styles.recentRow}><MemberAvatar member={member} size={38} /><View style={{ flex: 1 }}><Text style={[styles.recentName, { color: colors.foreground }]}>{member.name}</Text><Text style={[styles.recentMeta, { color: colors.mutedForeground }]}>Joined {formatDate(member.joinDate)}</Text></View><StatusPill status={memberStatus(member)} /></Pressable>)}
    <PrimaryButton title="Open reports" icon="bar-chart-2" secondary onPress={() => router.push('/reports')} />
  </ScreenScroll>;
}

function QuickAction({ icon, label, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}><View style={[styles.quickIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={18} color={colors.secondaryForeground} /></View><Text style={[styles.quickLabel, { color: colors.foreground }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  bell: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: 9, top: 8, width: 7, height: 7, borderRadius: 4, borderWidth: 1, borderColor: '#FFFFFF' },
  hero: { marginTop: 4, borderRadius: 24, padding: 20, minHeight: 145, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  heroCopy: { flex: 1 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.3 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.7, marginTop: 9 },
  heroBody: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 8, lineHeight: 18 },
  heroOrb: { width: 58, height: 58, borderRadius: 22, justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '-8deg' }] },
  statsGrid: { flexDirection: 'row', gap: 10, marginTop: 10 },
  statColumn: { flex: 1, gap: 10 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  quickAction: { width: '48%', borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  quickIcon: { width: 33, height: 33, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  alertRow: { borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 8 },
  alertIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  alertTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  alertText: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  clearRow: { borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  clearText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 },
  recentName: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  recentMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
});