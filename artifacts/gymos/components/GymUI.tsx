import { Feather } from '@expo/vector-icons';
import React, { PropsWithChildren } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatDate, Member, memberStatus } from '@/lib/gymos-data';

export function Screen({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const colors = useColors();
  return <View style={[styles.screen, { backgroundColor: colors.background }, style]}>{children}</View>;
}

export function ScreenScroll({ children, style, ...props }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; [key: string]: unknown }>) {
  const colors = useColors();
  const { ScrollView } = require('react-native');
  return <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.scrollContent, style]} showsVerticalScrollIndicator={false} {...props}>{children}</ScrollView>;
}

export function Header({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode }) {
  const colors = useColors();
  return <View style={styles.header}>
    <View style={styles.headerLeft}>
      {onBack ? <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}><Feather name="arrow-left" size={21} color={colors.foreground} /></Pressable> : null}
      <View><Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>{subtitle ? <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}</View>
    </View>
    {right}
  </View>;
}

export function LogoMark({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return <View style={styles.logoRow}><View style={[styles.logoMark, { backgroundColor: colors.accent }]}><Feather name="activity" size={compact ? 16 : 20} color={colors.foreground} /></View>{!compact ? <Text style={[styles.logoText, { color: colors.foreground }]}>GYM<Text style={{ color: colors.primary }}>OS</Text></Text> : null}</View>;
}

export function SearchField({ value, onChangeText, placeholder = 'Search members...' }: Pick<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>) {
  const colors = useColors();
  return <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} /></View>;
}

export function StatusPill({ status }: { status: string }) {
  const colors = useColors();
  const tone = status === 'Active' ? { bg: '#E8F5D4', fg: '#42602A' } : status === 'Expiring Soon' ? { bg: '#FFF2D6', fg: '#A26B18' } : status === 'Archived' ? { bg: colors.muted, fg: colors.mutedForeground } : { bg: '#FBE4DF', fg: '#A84536' };
  return <View style={[styles.pill, { backgroundColor: tone.bg }]}><View style={[styles.pillDot, { backgroundColor: tone.fg }]} /><Text style={[styles.pillText, { color: tone.fg }]}>{status}</Text></View>;
}

export function MemberAvatar({ member, size = 46 }: { member: Member; size?: number }) {
  const colors = useColors();
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.secondary }]}><Text style={[styles.avatarText, { color: colors.secondaryForeground, fontSize: size * 0.36 }]}>{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</Text></View>;
}

export function MemberRow({ member, onPress, trailing }: { member: Member; onPress: () => void; trailing?: React.ReactNode }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.memberRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.78 : 1 }]}>
    <MemberAvatar member={member} /><View style={styles.memberInfo}><Text style={[styles.memberName, { color: colors.foreground }]} numberOfLines={1}>{member.name}</Text><Text style={[styles.memberMeta, { color: colors.mutedForeground }]}>{member.memberCode} · {member.phone}</Text></View>{trailing ?? <View style={styles.rowRight}><StatusPill status={memberStatus(member)} /><Text style={[styles.expiry, { color: colors.mutedForeground }]}>{member.membership ? `Until ${formatDate(member.membership.endDate)}` : 'No membership'}</Text></View>}<Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={styles.sectionTitle}><Text style={[styles.sectionHeading, { color: colors.foreground }]}>{title}</Text>{action ? <Pressable onPress={onAction}><Text style={[styles.sectionAction, { color: colors.secondaryForeground }]}>{action}</Text></Pressable> : null}</View>;
}

export function StatCard({ label, value, icon, accent = false, onPress }: { label: string; value: string | number; icon: keyof typeof Feather.glyphMap; accent?: boolean; onPress?: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.statCard, { backgroundColor: accent ? colors.primary : colors.card, borderColor: accent ? colors.primary : colors.border, opacity: pressed ? 0.84 : 1 }]}><View style={[styles.statIcon, { backgroundColor: accent ? 'rgba(199,243,107,0.18)' : colors.secondary }]}><Feather name={icon} size={17} color={accent ? colors.accent : colors.secondaryForeground} /></View><Text style={[styles.statValue, { color: accent ? colors.primaryForeground : colors.foreground }]}>{value}</Text><Text style={[styles.statLabel, { color: accent ? '#B9C6BC' : colors.mutedForeground }]}>{label}</Text></Pressable>;
}

export function PrimaryButton({ title, icon, onPress, disabled = false, secondary = false }: { title: string; icon?: keyof typeof Feather.glyphMap; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  const colors = useColors();
  return <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.primaryButton, { backgroundColor: secondary ? colors.secondary : colors.primary, opacity: disabled ? 0.45 : pressed ? 0.78 : 1 }]}>{icon ? <Feather name={icon} size={17} color={secondary ? colors.secondaryForeground : colors.primaryForeground} /> : null}<Text style={[styles.primaryButtonText, { color: secondary ? colors.secondaryForeground : colors.primaryForeground }]}>{title}</Text></Pressable>;
}

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  const colors = useColors();
  return <View style={styles.field}><Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text><TextInput {...props} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: error ? colors.destructive : colors.input, backgroundColor: colors.card }]} />{error ? <Text style={[styles.fieldError, { color: colors.destructive }]}>{error}</Text> : null}</View>;
}

export function ChoiceChips({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (value: string) => void }) {
  const colors = useColors();
  return <View style={styles.chipWrap}>{options.map((option) => <Pressable key={option} onPress={() => onSelect(option)} style={[styles.choiceChip, { backgroundColor: selected === option ? colors.primary : colors.card, borderColor: selected === option ? colors.primary : colors.border }]}><Text style={{ color: selected === option ? colors.primaryForeground : colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>{option}</Text></Pressable>)}</View>;
}

export function EmptyState({ icon, title, body }: { icon: keyof typeof Feather.glyphMap; title: string; body: string }) {
  const colors = useColors();
  return <View style={styles.emptyState}><View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={22} color={colors.secondaryForeground} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{body}</Text></View>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 110 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  backButton: { padding: 4, marginLeft: -5 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.6 },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoMark: { width: 34, height: 34, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: 1.2 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, height: 48 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start', gap: 5 },
  pillDot: { width: 5, height: 5, borderRadius: 3 },
  pillText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  avatar: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: 'Inter_700Bold' },
  memberRow: { borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 9 },
  memberInfo: { flex: 1, minWidth: 0 },
  memberName: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  memberMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  expiry: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 11 },
  sectionHeading: { fontFamily: 'Inter_700Bold', fontSize: 17, letterSpacing: -0.2 },
  sectionAction: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  statCard: { flex: 1, minHeight: 108, borderRadius: 18, borderWidth: 1, padding: 13, justifyContent: 'space-between' },
  statIcon: { width: 31, height: 31, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 22, marginTop: 4 },
  statLabel: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  primaryButton: { height: 50, borderRadius: 15, paddingHorizontal: 17, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  primaryButtonText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  field: { marginBottom: 14 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { height: 48, borderRadius: 13, borderWidth: 1, paddingHorizontal: 13, fontFamily: 'Inter_400Regular', fontSize: 14 },
  fieldError: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  emptyState: { alignItems: 'center', paddingHorizontal: 34, paddingVertical: 45 },
  emptyIcon: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 5 },
});