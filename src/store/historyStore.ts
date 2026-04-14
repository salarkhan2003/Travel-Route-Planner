import { create } from 'zustand';

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

export const useHistoryStore = create<HistoryState>()((set) => ({
  trips: [],
  addTrip: (trip) => set((s) => ({
    trips: [{ ...trip, id: `trip-${Date.now()}` }, ...s.trips],
  })),
  updateStatus: (id, status) => set((s) => ({
    trips: s.trips.map((t) => t.id === id ? { ...t, status } : t),
  })),
}));
