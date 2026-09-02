import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import {
  AttendanceRecord, AuditLog, GymData, GymSettings, initialGymData, makeId,
  Member, Notification, Payment, PaymentMethod, Plan, Trainer,
} from '@/lib/gymos-data';

type GymContextValue = {
  data: GymData;
  hydrated: boolean;
  addMember: (member: Omit<Member, 'id' | 'memberCode'>) => Member;
  updateMember: (id: string, patch: Partial<Member>) => void;
  archiveMember: (id: string, archived?: boolean) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'receiptNumber' | 'transactionId' | 'status'>) => Payment;
  voidPayment: (id: string, reason: string) => void;
  addAttendance: (memberId: string) => AttendanceRecord;
  checkoutAttendance: (id: string) => void;
  addPlan: (plan: Omit<Plan, 'id'>) => void;
  togglePlan: (id: string) => void;
  addTrainer: (trainer: Omit<Trainer, 'id'>) => void;
  updateSettings: (patch: Partial<GymSettings>) => void;
  markNotificationRead: (id: string) => void;
  addAudit: (entry: Omit<AuditLog, 'id' | 'date'>) => void;
};

const STORAGE_KEY = 'gymos-data-v1';
const GymContext = createContext<GymContextValue | null>(null);

export function GymProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<GymData>(initialGymData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) setData(JSON.parse(stored) as GymData);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => undefined);
  }, [data, hydrated]);

  const mutate = (updater: (current: GymData) => GymData) => setData((current) => updater(current));
  const addAudit = (entry: Omit<AuditLog, 'id' | 'date'>) =>
    mutate((current) => ({ ...current, auditLogs: [{ ...entry, id: makeId('audit'), date: new Date().toISOString() }, ...current.auditLogs] }));

  const value = useMemo<GymContextValue>(() => ({
    data, hydrated,
    addMember: (member) => {
      const created: Member = { ...member, id: makeId('member'), memberCode: `GYM-${Math.floor(1000 + Math.random() * 8999)}` };
      mutate((current) => ({
        ...current,
        members: [created, ...current.members],
        auditLogs: [{ id: makeId('audit'), action: 'Member added', detail: `${created.name} joined the gym`, date: new Date().toISOString(), memberId: created.id }, ...current.auditLogs],
        notifications: [{ id: makeId('notification'), title: 'New member added', body: `${created.name} joined the gym.`, type: 'member', date: new Date().toISOString(), read: false, memberId: created.id }, ...current.notifications],
      }));
      return created;
    },
    updateMember: (id, patch) => mutate((current) => ({
      ...current,
      members: current.members.map((member) => member.id === id ? { ...member, ...patch } : member),
      auditLogs: [{ id: makeId('audit'), action: 'Member edited', detail: 'Member profile details were updated', date: new Date().toISOString(), memberId: id }, ...current.auditLogs],
    })),
    archiveMember: (id, archived = true) => mutate((current) => ({
      ...current,
      members: current.members.map((member) => member.id === id ? { ...member, archived } : member),
      auditLogs: [{ id: makeId('audit'), action: archived ? 'Member archived' : 'Member restored', detail: archived ? 'Member moved to archive' : 'Member restored', date: new Date().toISOString(), memberId: id }, ...current.auditLogs],
    })),
    addPayment: (payment) => {
      const created: Payment = { ...payment, id: makeId('payment'), receiptNumber: `RCP-${Math.floor(10000 + Math.random() * 89999)}`, transactionId: `TXN-${Math.floor(100000 + Math.random() * 899999)}`, status: 'completed' };
      mutate((current) => {
        const member = current.members.find((item) => item.id === payment.memberId);
        return {
          ...current,
          payments: [created, ...current.payments],
          auditLogs: [{ id: makeId('audit'), action: 'Payment recorded', detail: `${created.receiptNumber} · ${member?.name ?? 'Member'} · Rs. ${created.amount.toLocaleString()}`, date: new Date().toISOString(), memberId: payment.memberId }, ...current.auditLogs],
          notifications: [{ id: makeId('notification'), title: 'Payment recorded', body: `Rs. ${created.amount.toLocaleString()} received from ${member?.name ?? 'member'}.`, type: 'payment', date: new Date().toISOString(), read: false, memberId: payment.memberId }, ...current.notifications],
        };
      });
      return created;
    },
    voidPayment: (id, reason) => mutate((current) => {
      const payment = current.payments.find((item) => item.id === id);
      return {
        ...current,
        payments: current.payments.map((item) => item.id === id ? { ...item, status: 'voided' } : item),
        auditLogs: [{ id: makeId('audit'), action: 'Payment voided', detail: `${payment?.receiptNumber ?? 'Payment'} · ${reason}`, date: new Date().toISOString(), memberId: payment?.memberId }, ...current.auditLogs],
      };
    }),
    addAttendance: (memberId) => {
      const created: AttendanceRecord = { id: makeId('attendance'), memberId, checkIn: new Date().toISOString(), source: 'manual' };
      mutate((current) => ({ ...current, attendance: [created, ...current.attendance], auditLogs: [{ id: makeId('audit'), action: 'Attendance recorded', detail: 'Manual check-in recorded', date: new Date().toISOString(), memberId }, ...current.auditLogs] }));
      return created;
    },
    checkoutAttendance: (id) => mutate((current) => ({ ...current, attendance: current.attendance.map((item) => item.id === id ? { ...item, checkOut: new Date().toISOString() } : item) })),
    addPlan: (plan) => mutate((current) => ({ ...current, plans: [...current.plans, { ...plan, id: makeId('plan') }] })),
    togglePlan: (id) => mutate((current) => ({ ...current, plans: current.plans.map((plan) => plan.id === id ? { ...plan, active: !plan.active } : plan) })),
    addTrainer: (trainer) => mutate((current) => ({ ...current, trainers: [...current.trainers, { ...trainer, id: makeId('trainer') }] })),
    updateSettings: (patch) => mutate((current) => ({ ...current, settings: { ...current.settings, ...patch } })),
    markNotificationRead: (id) => mutate((current) => ({ ...current, notifications: current.notifications.map((item) => item.id === id ? { ...item, read: true } : item) })),
    addAudit,
  }), [data, hydrated]);

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
}

export function useGym() {
  const context = useContext(GymContext);
  if (!context) throw new Error('useGym must be used inside GymProvider');
  return context;
}