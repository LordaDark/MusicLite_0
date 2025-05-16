import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeName } from 'react-native';

interface ThemeState {
  theme: 'dark' | 'light';
  systemTheme: ColorSchemeName;
  useSystemTheme: boolean;
  
  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  setSystemTheme: (theme: ColorSchemeName) => void;
  toggleUseSystemTheme: () => void;
  toggleTheme: () => void;
  
  // Computed
  getCurrentTheme: () => 'dark' | 'light';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      systemTheme: null,
      useSystemTheme: false,
      
      setTheme: (theme) => set({ theme }),
      
      setSystemTheme: (systemTheme) => set({ systemTheme }),
      
      toggleUseSystemTheme: () => set((state) => ({ 
        useSystemTheme: !state.useSystemTheme 
      })),
      
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
      
      getCurrentTheme: () => {
        const { theme, systemTheme, useSystemTheme } = get();
        
        if (useSystemTheme && systemTheme) {
          return systemTheme === 'dark' ? 'dark' : 'light';
        }
        
        return theme;
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);