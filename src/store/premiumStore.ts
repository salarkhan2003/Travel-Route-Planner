import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PremiumState {
  isPremium: boolean;
  betaActivatedAt: string | null;
  userName: string;
  setPremium: (val: boolean, name?: string) => void;
  setUserName: (name: string) => void;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      betaActivatedAt: null,
      userName: 'Traveller',
      setPremium: (val, name) =>
        set({
          isPremium: val,
          betaActivatedAt: val ? new Date().toISOString() : null,
          ...(name ? { userName: name } : {}),
        }),
      setUserName: (name) => set({ userName: name }),
    }),
    { name: 'roamio-premium', storage: createJSONStorage(() => AsyncStorage) }
  )
);
