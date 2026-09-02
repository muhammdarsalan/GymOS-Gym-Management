export type Plan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  active: boolean;
};

export type Trainer = {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  notes: string;
};

export type Membership = {
  id: string;
  planId: string;
  startDate: string;
  endDate: string;
};

export type Member = {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  emergencyContact: string;
  joinDate: string;
  trainerId?: string;
  notes: string;
  archived: boolean;
  membership?: Membership;
};

export type PaymentMethod = 'Cash' | 'Easypaisa' | 'JazzCash' | 'Bank Transfer' | 'Card';

export type Payment = {
  id: string;
  receiptNumber: string;
  transactionId: string;
  memberId: string;
  membershipId?: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  notes: string;
  status: 'completed' | 'voided';
};

export type AttendanceRecord = {
  id: string;
  memberId: string;
  checkIn: string;
  checkOut?: string;
  source: 'manual' | 'biometric';
};

export type AuditLog = {
  id: string;
  action: string;
  detail: string;
  date: string;
  memberId?: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: 'expiry' | 'payment' | 'member' | 'system';
  date: string;
  read: boolean;
  memberId?: string;
};

export type GymSettings = {
  name: string;
  phone: string;
  address: string;
  expiryReminders: boolean;
  allowExpiredCheckIn: boolean;
};

export type GymData = {
  members: Member[];
  plans: Plan[];
  trainers: Trainer[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  settings: GymSettings;
};

export const iso = (daysFromToday: number, hour = 9) => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString();
};

export const makeId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const memberStatus = (member: Member) => {
  if (member.archived) return 'Archived' as const;
  if (!member.membership) return 'Expired' as const;
  const end = new Date(member.membership.endDate).getTime();
  const days = Math.ceil((end - Date.now()) / 86400000);
  if (days < 0) return 'Expired' as const;
  if (days <= 7) return 'Expiring Soon' as const;
  return 'Active' as const;
};

export const formatRs = (amount: number) =>
  `Rs. ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

export const formatDate = (date: string, includeYear = false) =>
  new Date(date).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
  });

export const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit' });

export const daysUntil = (date: string) =>
  Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);

const plans: Plan[] = [
  { id: 'plan_monthly', name: 'Monthly', price: 5000, durationDays: 30, active: true },
  { id: 'plan_quarterly', name: 'Quarterly', price: 13500, durationDays: 90, active: true },
  { id: 'plan_yearly', name: 'Yearly', price: 50000, durationDays: 365, active: true },
];

const trainers: Trainer[] = [
  { id: 'trainer_sana', name: 'Sana Malik', phone: '0300 4567890', specialization: 'Strength & Conditioning', notes: 'Morning floor lead.' },
  { id: 'trainer_hamza', name: 'Hamza Raza', phone: '0321 7788123', specialization: 'Functional Training', notes: 'Certified mobility coach.' },
  { id: 'trainer_ayesha', name: 'Ayesha Khan', phone: '0333 9021345', specialization: 'Women’s Fitness', notes: 'Leads the 6pm group.' },
];

const names = [
  'Maham Ahmed', 'Usman Tariq', 'Hira Shah', 'Bilal Qureshi', 'Zainab Ali',
  'Owais Hassan', 'Eman Siddiqui', 'Saad Mahmood', 'Noor Fatima', 'Daniyal Khan',
  'Anaya Rauf', 'Fahad Iqbal', 'Mehwish Aslam', 'Arham Sheikh', 'Saira Javed',
];

const members: Member[] = names.map((name, index) => {
  const plan = plans[index % plans.length];
  const startOffset = index < 10 ? -(index * 3 + 4) : -(index * 8 + 25);
  const endOffset = index === 3 ? 3 : index === 7 ? -4 : index === 11 ? -18 : startOffset + plan.durationDays;
  return {
    id: `member_${index + 1}`,
    memberCode: `GYM-${String(1042 + index).padStart(4, '0')}`,
    name,
    phone: `03${String(100000000 + index * 142739).slice(0, 9)}`,
    gender: index % 2 === 0 ? 'Female' : 'Male',
    dob: iso(-(9000 + index * 170)),
    address: `${12 + index}, Clifton Block ${index % 7 + 1}, Karachi`,
    emergencyContact: `03${String(200000000 + index * 192831).slice(0, 9)}`,
    joinDate: iso(startOffset),
    trainerId: trainers[index % trainers.length].id,
    notes: index % 4 === 0 ? 'Prefers early morning sessions.' : '',
    archived: index === 14,
    membership: {
      id: `membership_${index + 1}`,
      planId: plan.id,
      startDate: iso(startOffset),
      endDate: iso(endOffset),
    },
  };
});

const payments: Payment[] = members.slice(0, 9).map((member, index) => ({
  id: `payment_${index + 1}`,
  receiptNumber: `RCP-${String(2408 + index).padStart(5, '0')}`,
  transactionId: `TXN-${String(88031 + index * 17)}`,
  memberId: member.id,
  membershipId: member.membership?.id,
  amount: plans[index % plans.length].price,
  method: (['Cash', 'Easypaisa', 'JazzCash', 'Bank Transfer', 'Card'][index % 5]) as PaymentMethod,
  date: iso(-index, 10 + index),
  notes: index === 0 ? 'Walk-in renewal.' : '',
  status: 'completed',
}));

const attendance: AttendanceRecord[] = members.slice(0, 8).flatMap((member, index) => [
  { id: `attendance_${index + 1}`, memberId: member.id, checkIn: iso(-(index % 4), 6 + index), checkOut: iso(-(index % 4), 7 + index), source: 'manual' as const },
]);

export const initialGymData: GymData = {
  members,
  plans,
  trainers,
  payments,
  attendance,
  auditLogs: [
    { id: 'audit_1', action: 'Payment recorded', detail: 'RCP-02408 · Maham Ahmed · Rs. 5,000', date: iso(0, 10), memberId: 'member_1' },
    { id: 'audit_2', action: 'Member added', detail: 'Owais Hassan joined the gym', date: iso(-1, 14), memberId: 'member_6' },
    { id: 'audit_3', action: 'Membership renewed', detail: 'Hira Shah · Quarterly plan', date: iso(-2, 18), memberId: 'member_3' },
    { id: 'audit_4', action: 'Attendance recorded', detail: 'Usman Tariq checked in', date: iso(-2, 7), memberId: 'member_2' },
  ],
  notifications: [
    { id: 'note_1', title: 'Membership expiring soon', body: 'Bilal Qureshi expires in 3 days.', type: 'expiry', date: iso(0, 8), read: false, memberId: 'member_4' },
    { id: 'note_2', title: 'Payment recorded', body: 'Rs. 5,000 received from Maham Ahmed.', type: 'payment', date: iso(0, 10), read: false, memberId: 'member_1' },
    { id: 'note_3', title: 'New member added', body: 'Owais Hassan joined the gym yesterday.', type: 'member', date: iso(-1, 14), read: true, memberId: 'member_6' },
  ],
  settings: {
    name: 'Forge Fitness Club',
    phone: '021 3581 2000',
    address: '15-C, Khayaban-e-Shahbaz, Karachi',
    expiryReminders: true,
    allowExpiredCheckIn: false,
  },
};