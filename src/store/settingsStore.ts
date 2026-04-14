import { create } from 'zustand';

export interface SettingsState {
  darkMode: boolean;
  currency: string;
  mapStyle: 'standard' | 'satellite' | 'blueprint';
  travelClass: '1AC' | '2AC' | '3AC' | 'Sleeper' | 'Economy' | 'Business';
  budgetAlertThreshold: number;
  distanceUnit: 'km' | 'miles';
  biometricLock: boolean;
  cloudSync: boolean;
  notifications: boolean;
  toggleDark: () => void;
  setCurrency: (c: string) => void;
  setMapStyle: (s: SettingsState['mapStyle']) => void;
  setTravelClass: (c: SettingsState['travelClass']) => void;
  setBudgetAlert: (n: number) => void;
  setDistanceUnit: (u: 'km' | 'miles') => void;
  toggleBiometric: () => void;
  toggleCloudSync: () => void;
  toggleNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  darkMode: true,
  currency: 'INR',
  mapStyle: 'standard',
  travelClass: '3AC',
  budgetAlertThreshold: 80,
  distanceUnit: 'km',
  biometricLock: false,
  cloudSync: false,
  notifications: true,
  toggleDark: () => set((s) => ({ darkMode: !s.darkMode })),
  setCurrency: (currency) => set({ currency }),
  setMapStyle: (mapStyle) => set({ mapStyle }),
  setTravelClass: (travelClass) => set({ travelClass }),
  setBudgetAlert: (budgetAlertThreshold) => set({ budgetAlertThreshold }),
  setDistanceUnit: (distanceUnit) => set({ distanceUnit }),
  toggleBiometric: () => set((s) => ({ biometricLock: !s.biometricLock })),
  toggleCloudSync: () => set((s) => ({ cloudSync: !s.cloudSync })),
  toggleNotifications: () => set((s) => ({ notifications: !s.notifications })),
}));
