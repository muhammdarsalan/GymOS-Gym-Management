import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGym } from '@/context/GymContext';
import { MemberRow, ScreenScroll, SearchField, Header, EmptyState, ChoiceChips } from '@/components/GymUI';
import { memberStatus } from '@/lib/gymos-data';
import { useColors } from '@/hooks/useColors';

const filters = ['All', 'Active', 'Expiring Soon', 'Expired', 'Archived'];

export default function MembersScreen() {
  const colors = useColors();
  const { data } = useGym();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const members = useMemo(() => data.members.filter((member) => {
    const matches = `${member.name} ${member.phone} ${member.memberCode}`.toLowerCase().includes(query.toLowerCase());
    const status = memberStatus(member);
    return matches && (filter === 'All' || status === filter);
  }), [data.members, filter, query]);
  return <ScreenScroll><Header title="Members" subtitle={`${data.members.filter((item) => !item.archived).length} active profiles`} right={<Pressable onPress={() => router.push('/member/new')} style={[styles.addButton, { backgroundColor: colors.primary }]}><Feather name="plus" size={19} color={colors.primaryForeground} /></Pressable>} /><SearchField value={query} onChangeText={setQuery} placeholder="Name, phone or member ID" /><View style={styles.filterScroll}><ChoiceChips options={filters} selected={filter} onSelect={setFilter} /></View><View style={styles.listHeader}><Text style={[styles.listCount, { color: colors.mutedForeground }]}>{members.length} {members.length === 1 ? 'member' : 'members'}</Text><Pressable onPress={() => setFilter('All')}><Feather name="sliders" size={16} color={colors.mutedForeground} /></Pressable></View>{members.length ? members.map((member) => <MemberRow key={member.id} member={member} onPress={() => router.push({ pathname: '/member/[id]', params: { id: member.id } })} />) : <EmptyState icon="users" title="No members found" body="Try a different search or add a new member to your gym." />}</ScreenScroll>;
}
const styles = StyleSheet.create({ addButton: { width: 38, height: 38, borderRadius: 13, justifyContent: 'center', alignItems: 'center' }, filterScroll: { marginTop: 14 }, listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 17 }, listCount: { fontFamily: 'Inter_500Medium', fontSize: 12 } });