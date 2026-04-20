import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TripStatus = 'booked' | 'ongoing' | 'completed' | 'cancelled';

export interface HistoryTrip {
  id: string;
  routeId: string;
  title: string;
  cities: string[];
  startDate: string;
  endDate: string;
  status: TripStatus;
  totalSpent: number;
  members: number;
}

export interface HistoryState {
  trips: HistoryTrip[];
  addTrip: (trip: Omit<HistoryTrip, 'id'>) => void;
  updateStatus: (id: string, status: TripStatus) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
  trips: [],
  addTrip: (trip) => set((s) => ({
    trips: [{ ...trip, id: `trip-${Date.now()}` }, ...s.trips],
  })),
  updateStatus: (id, status) => set((s) => ({
    trips: s.trips.map((t) => t.id === id ? { ...t, status } : t),
  })),
}),
{
  name: 'history-storage',
  storage: createJSONStorage(() => AsyncStorage),
}
));
