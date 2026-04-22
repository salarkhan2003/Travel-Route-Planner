import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LanguageCode = 
  | 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'ur' | 'gu' | 'kn' | 'or' | 'ml' | 'pa' | 'as' | 'bh' | 'sa' | 'ks' | 'ne' | 'kok' | 'sd' | 'doi' | 'mni' | 'san'
  | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ar' | 'ru' | 'pt' | 'it' | 'tr' | 'vi' | 'th' | 'nl' | 'el' | 'pl' | 'sv' | 'id' | 'ms' | 'fa' | 'he' | 'no' | 'da' | 'fi' | 'hu' | 'cs' | 'ro' | 'bg';

interface SettingsState {
  currency: string;
  language: LanguageCode;
  units: 'metric' | 'imperial';
  darkMode: boolean;
  setCurrency: (c: string) => void;
  setLanguage: (l: LanguageCode) => void;
  setUnits: (u: 'metric' | 'imperial') => void;
  setDarkMode: (d: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'INR',
      language: 'en',
      units: 'metric',
      darkMode: false,
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setUnits: (units) => set({ units }),
      setDarkMode: (darkMode) => set({ darkMode }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
