import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ModeStore = {
  lightMode: boolean;
  setLightMode: (val: boolean) => void;
};

const useLightModeStore = create<ModeStore>()(
  persist(
    (set) => ({
      lightMode: false,
      setLightMode: (val) => set({ lightMode: val }),
    }),
    {
      name: 'light-mode-storage', // ⚠️ also changed — was duplicate of 'user-storage'
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
);

export default useLightModeStore;