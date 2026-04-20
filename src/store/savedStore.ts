import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedState {
  savedIds: string[];
  toggle: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
  savedIds: [],
  toggle: (id) => set((s) => ({
    savedIds: s.savedIds.includes(id)
      ? s.savedIds.filter((x) => x !== id)
      : [...s.savedIds, id],
  })),
  isSaved: (id) => get().savedIds.includes(id),
}),
{
  name: 'saved-storage',
  storage: createJSONStorage(() => AsyncStorage),
}
));
