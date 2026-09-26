import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import {
  useListMembers, useCreateMember, useUpdateMember, useArchiveMember, useUpsertMembership,
  getListMembersQueryKey,
  useListPlans, useCreatePlan, useTogglePlan, getListPlansQueryKey,
  useListTrainers, useCreateTrainer, getListTrainersQueryKey,
  useListPayments, useCreatePayment, useVoidPayment, getListPaymentsQueryKey,
  useListAttendance, useCreateAttendance, useCheckoutAttendance, getListAttendanceQueryKey,
} from '@workspace/api-client-react';
import type {
  Member as ServerMember,
  Payment as ServerPayment,
  Attendance as ServerAttendance,
  Plan as ServerPlan,
  Trainer as ServerTrainer,
  MemberInput,
  MemberPatch as MemberPatchInput,
} from '@workspace/api-client-react';
import {
  AttendanceRecord, AuditLog, GymData, GymSettings, initialGymData, makeId,
  Member, Notification, Payment, PaymentMethod, Plan, Trainer,
} from '@/lib/gymos-data';

type GymContextValue = {
  data: GymData;
  hydrated: boolean;
  addMember: (member: Omit<Member, 'id' | 'memberCode'>) => Promise<Member>;
  updateMember: (id: string, patch: Partial<Member>) => Promise<void>;
  archiveMember: (id: string, archived?: boolean) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'receiptNumber' | 'transactionId' | 'status'>) => Promise<Payment>;
  voidPayment: (id: string, reason: string) => Promise<void>;
  addAttendance: (memberId: string) => Promise<AttendanceRecord>;
  checkoutAttendance: (id: string) => Promise<void>;
  addPlan: (plan: Omit<Plan, 'id'>) => Promise<void>;
  togglePlan: (id: string) => Promise<void>;
  addTrainer: (trainer: Omit<Trainer, 'id'>) => Promise<void>;
  updateSettings: (patch: Partial<GymSettings>) => void;
  markNotificationRead: (id: string) => void;
  addAudit: (entry: Omit<AuditLog, 'id' | 'date'>) => void;
};

// Only auditLogs/notifications/settings still live purely on-device: there is
// no /audit, /notifications or /settings API route (see Phase 5 handoff
// notes). members/plans/trainers/payments/attendance now come from the
// server instead of this local store.
type LocalGymData = Pick<GymData, 'auditLogs' | 'notifications' | 'settings'>;

const STORAGE_KEY = 'gymos-data-v1';
const GymContext = createContext<GymContextValue | null>(null);

// --- Adapters: generated API types use `null` for "not set"; the app's
// local types (gymos-data.ts) use `undefined`, matching how every screen
// already reads them (e.g. `member.trainerId ?`). ---
const toLocalMember = (row: ServerMember): Member => ({
  id: row.id,
  memberCode: row.memberCode,
  name: row.name,
  phone: row.phone,
  gender: row.gender,
  dob: row.dob ?? '',
  address: row.address,
  emergencyContact: row.emergencyContact,
  joinDate: row.joinDate,
  trainerId: row.trainerId ?? undefined,
  notes: row.notes,
  archived: row.archived,
  membership: row.membership ?? undefined,
});

const toLocalPayment = (row: ServerPayment): Payment => ({
  ...row,
  membershipId: row.membershipId ?? undefined,
});

const toLocalAttendance = (row: ServerAttendance): AttendanceRecord => ({
  ...row,
  checkOut: row.checkOut ?? undefined,
});

// Plan/Trainer are structurally identical between the server and local
// types (no nullable fields to adapt), so server rows are used as-is.

const toMemberInputBody = (member: Omit<Member, 'id' | 'memberCode'>): MemberInput => ({
  name: member.name,
  phone: member.phone,
  gender: member.gender,
  dob: member.dob,
  address: member.address,
  emergencyContact: member.emergencyContact,
  trainerId: member.trainerId,
  notes: member.notes,
});

const toMemberPatchBody = (patch: Partial<Member>): MemberPatchInput => {
  const body: MemberPatchInput = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.phone !== undefined) body.phone = patch.phone;
  if (patch.gender !== undefined) body.gender = patch.gender;
  if (patch.dob !== undefined) body.dob = patch.dob;
  if (patch.address !== undefined) body.address = patch.address;
  if (patch.emergencyContact !== undefined) body.emergencyContact = patch.emergencyContact;
  if (patch.trainerId !== undefined) body.trainerId = patch.trainerId;
  if (patch.notes !== undefined) body.notes = patch.notes;
  return body;
};

// Every network-backed mutation goes through this so a failed request
// surfaces to the gym staff (a native Alert) instead of silently no-op'ing -
// none of the screens that call these functions have their own try/catch.
async function withErrorAlert<T>(action: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please check your connection and try again.';
    Alert.alert(`Couldn't ${action}`, message);
    throw error;
  }
}

export function GymProvider({ children }: PropsWithChildren) {
  const { isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const canFetch = isLoaded && !!isSignedIn;

  const [localData, setLocalData] = useState<LocalGymData>({
    auditLogs: initialGymData.auditLogs,
    notifications: initialGymData.notifications,
    settings: initialGymData.settings,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<GymData>;
          setLocalData({
            auditLogs: parsed.auditLogs ?? initialGymData.auditLogs,
            notifications: parsed.notifications ?? initialGymData.notifications,
            settings: parsed.settings ?? initialGymData.settings,
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localData)).catch(() => undefined);
  }, [localData, hydrated]);

  const membersKey = getListMembersQueryKey();
  const plansKey = getListPlansQueryKey();
  const trainersKey = getListTrainersQueryKey();
  const paymentsKey = getListPaymentsQueryKey();
  const attendanceKey = getListAttendanceQueryKey();

  const membersQuery = useListMembers({ query: { queryKey: membersKey, enabled: canFetch } });
  const plansQuery = useListPlans({ query: { queryKey: plansKey, enabled: canFetch } });
  const trainersQuery = useListTrainers({ query: { queryKey: trainersKey, enabled: canFetch } });
  const paymentsQuery = useListPayments({ query: { queryKey: paymentsKey, enabled: canFetch } });
  const attendanceQuery = useListAttendance({ query: { queryKey: attendanceKey, enabled: canFetch } });

  const createMemberMutation = useCreateMember();
  const updateMemberMutation = useUpdateMember();
  const archiveMemberMutation = useArchiveMember();
  const upsertMembershipMutation = useUpsertMembership();
  const createPlanMutation = useCreatePlan();
  const togglePlanMutation = useTogglePlan();
  const createTrainerMutation = useCreateTrainer();
  const createPaymentMutation = useCreatePayment();
  const voidPaymentMutation = useVoidPayment();
  const createAttendanceMutation = useCreateAttendance();
  const checkoutAttendanceMutation = useCheckoutAttendance();

  const addAudit = (entry: Omit<AuditLog, 'id' | 'date'>) =>
    setLocalData((current) => ({
      ...current,
      auditLogs: [{ ...entry, id: makeId('audit'), date: new Date().toISOString() }, ...current.auditLogs],
    }));

  const addNotification = (entry: Omit<Notification, 'id' | 'date' | 'read'>) =>
    setLocalData((current) => ({
      ...current,
      notifications: [{ ...entry, id: makeId('notification'), date: new Date().toISOString(), read: false }, ...current.notifications],
    }));

  const data: GymData = useMemo(() => ({
    members: (membersQuery.data ?? []).map(toLocalMember),
    plans: (plansQuery.data ?? []) as Plan[],
    trainers: (trainersQuery.data ?? []) as Trainer[],
    payments: (paymentsQuery.data ?? []).map(toLocalPayment),
    attendance: (attendanceQuery.data ?? []).map(toLocalAttendance),
    auditLogs: localData.auditLogs,
    notifications: localData.notifications,
    settings: localData.settings,
  }), [membersQuery.data, plansQuery.data, trainersQuery.data, paymentsQuery.data, attendanceQuery.data, localData]);

  const value = useMemo<GymContextValue>(() => ({
    data, hydrated,

    addMember: (member) => withErrorAlert('add member', async () => {
      let final = await createMemberMutation.mutateAsync({ data: toMemberInputBody(member) });
      if (member.membership) {
        final = await upsertMembershipMutation.mutateAsync({
          id: final.id,
          data: { planId: member.membership.planId, startDate: member.membership.startDate, endDate: member.membership.endDate },
        });
      }
      queryClient.setQueryData<ServerMember[]>(membersKey, (old) => [final, ...(old ?? [])]);
      addAudit({ action: 'Member added', detail: `${final.name} joined the gym`, memberId: final.id });
      addNotification({ title: 'New member added', body: `${final.name} joined the gym.`, type: 'member', memberId: final.id });
      return toLocalMember(final);
    }),

    updateMember: (id, patch) => withErrorAlert('update member', async () => {
      let final: ServerMember | undefined;
      if (patch.membership) {
        final = await upsertMembershipMutation.mutateAsync({
          id,
          data: { planId: patch.membership.planId, startDate: patch.membership.startDate, endDate: patch.membership.endDate },
        });
      }
      const patchBody = toMemberPatchBody(patch);
      if (Object.keys(patchBody).length > 0) {
        final = await updateMemberMutation.mutateAsync({ id, data: patchBody });
      }
      if (!final) return;
      const resolved = final;
      queryClient.setQueryData<ServerMember[]>(membersKey, (old) => (old ?? []).map((item) => item.id === id ? resolved : item));
      addAudit({ action: 'Member edited', detail: 'Member profile details were updated', memberId: id });
    }),

    archiveMember: (id, archived = true) => withErrorAlert(archived ? 'archive member' : 'restore member', async () => {
      const updated = await archiveMemberMutation.mutateAsync({ id, data: { archived } });
      queryClient.setQueryData<ServerMember[]>(membersKey, (old) => (old ?? []).map((item) => item.id === id ? updated : item));
      addAudit({
        action: archived ? 'Member archived' : 'Member restored',
        detail: archived ? 'Member moved to archive' : 'Member restored',
        memberId: id,
      });
    }),

    addPayment: (payment) => withErrorAlert('record payment', async () => {
      const created = await createPaymentMutation.mutateAsync({
        data: { memberId: payment.memberId, membershipId: payment.membershipId, amount: payment.amount, method: payment.method, notes: payment.notes },
      });
      queryClient.setQueryData<ServerPayment[]>(paymentsKey, (old) => [created, ...(old ?? [])]);
      const member = (membersQuery.data ?? []).find((item) => item.id === payment.memberId);
      addAudit({
        action: 'Payment recorded',
        detail: `${created.receiptNumber} \u00b7 ${member?.name ?? 'Member'} \u00b7 Rs. ${created.amount.toLocaleString()}`,
        memberId: payment.memberId,
      });
      addNotification({
        title: 'Payment recorded',
        body: `Rs. ${created.amount.toLocaleString()} received from ${member?.name ?? 'member'}.`,
        type: 'payment',
        memberId: payment.memberId,
      });
      return toLocalPayment(created);
    }),

    voidPayment: (id, reason) => withErrorAlert('void payment', async () => {
      const existing = (paymentsQuery.data ?? []).find((item) => item.id === id);
      const updated = await voidPaymentMutation.mutateAsync({ id, data: { reason } });
      queryClient.setQueryData<ServerPayment[]>(paymentsKey, (old) => (old ?? []).map((item) => item.id === id ? updated : item));
      addAudit({
        action: 'Payment voided',
        detail: `${existing?.receiptNumber ?? 'Payment'} \u00b7 ${reason}`,
        memberId: existing?.memberId,
      });
    }),

    addAttendance: (memberId) => withErrorAlert('record attendance', async () => {
      const created = await createAttendanceMutation.mutateAsync({ data: { memberId } });
      queryClient.setQueryData<ServerAttendance[]>(attendanceKey, (old) => [created, ...(old ?? [])]);
      addAudit({ action: 'Attendance recorded', detail: 'Manual check-in recorded', memberId });
      return toLocalAttendance(created);
    }),

    // No audit entry here, matching the API route and the original local
    // behavior: this app has never logged check-outs, only check-ins.
    checkoutAttendance: (id) => withErrorAlert('check out', async () => {
      const updated = await checkoutAttendanceMutation.mutateAsync({ id });
      queryClient.setQueryData<ServerAttendance[]>(attendanceKey, (old) => (old ?? []).map((item) => item.id === id ? updated : item));
    }),

    addPlan: (plan) => withErrorAlert('add plan', async () => {
      const created = await createPlanMutation.mutateAsync({ data: plan });
      queryClient.setQueryData<ServerPlan[]>(plansKey, (old) => [...(old ?? []), created]);
    }),

    togglePlan: (id) => withErrorAlert('update plan', async () => {
      const updated = await togglePlanMutation.mutateAsync({ id });
      queryClient.setQueryData<ServerPlan[]>(plansKey, (old) => (old ?? []).map((item) => item.id === id ? updated : item));
    }),

    addTrainer: (trainer) => withErrorAlert('add trainer', async () => {
      const created = await createTrainerMutation.mutateAsync({ data: trainer });
      queryClient.setQueryData<ServerTrainer[]>(trainersKey, (old) => [...(old ?? []), created]);
    }),

    updateSettings: (patch) => setLocalData((current) => ({ ...current, settings: { ...current.settings, ...patch } })),
    markNotificationRead: (id) => setLocalData((current) => ({
      ...current,
      notifications: current.notifications.map((item) => item.id === id ? { ...item, read: true } : item),
    })),
    addAudit,
  }), [
    data, hydrated, queryClient,
    membersQuery.data, paymentsQuery.data,
    createMemberMutation, updateMemberMutation, archiveMemberMutation, upsertMembershipMutation,
    createPlanMutation, togglePlanMutation, createTrainerMutation,
    createPaymentMutation, voidPaymentMutation, createAttendanceMutation, checkoutAttendanceMutation,
  ]);

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
}

export function useGym() {
  const context = useContext(GymContext);
  if (!context) throw new Error('useGym must be used inside GymProvider');
  return context;
}
