import { create } from 'zustand';

interface ToastState {
  show: boolean;
  message: string;
  icon: string;
  showToast: (message: string, icon?: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  show: false,
  message: '',
  icon: 'checkmark-circle',
  showToast: (message, icon = 'checkmark-circle') => {
    set({ show: true, message, icon });
    setTimeout(() => {
      set({ show: false });
    }, 3000); // auto hide after 3s
  },
  hideToast: () => set({ show: false }),
}));
