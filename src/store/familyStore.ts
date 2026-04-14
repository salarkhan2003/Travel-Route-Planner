import { create } from 'zustand';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  emoji: string;
  passportNo?: string;
  aadharNo?: string;
  isLeader: boolean;
}

export interface TripVow {
  id: string;
  title: string;
  location: string;
  fulfilled: boolean;
  emoji: string;
}

export interface FamilyState {
  members: FamilyMember[];
  vows: TripVow[];
  totalBudget: number;
  addMember: (m: Omit<FamilyMember, 'id'>) => void;
  removeMember: (id: string) => void;
  fulfillVow: (id: string) => void;
  addVow: (v: Omit<TripVow, 'id' | 'fulfilled'>) => void;
  setTotalBudget: (n: number) => void;
}

export const useFamilyStore = create<FamilyState>()((set) => ({
  members: [
    { id: 'me', name: 'Salar Khan', relation: 'Trip Leader', age: 22, emoji: '👨‍💼', isLeader: true },
    { id: 'm1', name: 'Dad', relation: 'Father', age: 52, emoji: '👨', isLeader: false },
    { id: 'm2', name: 'Mom', relation: 'Mother', age: 48, emoji: '👩', isLeader: false },
    { id: 'm3', name: 'Sister 1', relation: 'Sister', age: 25, emoji: '👧', isLeader: false },
    { id: 'm4', name: 'Sister 2', relation: 'Sister', age: 20, emoji: '👧', isLeader: false },
  ],
  vows: [
    { id: 'v1', title: 'Visit Ajmer Dargah', location: 'Ajmer', fulfilled: false, emoji: '🌙' },
    { id: 'v2', title: 'Pray at Taj Mahal', location: 'Agra', fulfilled: false, emoji: '🕌' },
    { id: 'v3', title: 'See Marina Bay Sands', location: 'Singapore', fulfilled: false, emoji: '🌃' },
  ],
  totalBudget: 150000,
  addMember: (m) => set((s) => ({ members: [...s.members, { ...m, id: `m${Date.now()}` }] })),
  removeMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id) })),
  fulfillVow: (id) => set((s) => ({ vows: s.vows.map((v) => v.id === id ? { ...v, fulfilled: true } : v) })),
  addVow: (v) => set((s) => ({ vows: [...s.vows, { ...v, id: `vow${Date.now()}`, fulfilled: false }] })),
  setTotalBudget: (totalBudget) => set({ totalBudget }),
}));
