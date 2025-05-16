import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const { getCurrentTheme, setSystemTheme } = useThemeStore();
  
  // Update system theme when it changes
  useEffect(() => {
    setSystemTheme(systemColorScheme);
  }, [systemColorScheme, setSystemTheme]);
  
  const currentTheme = getCurrentTheme();
  
  return {
    theme: currentTheme,
    colors: Colors[currentTheme],
    isDark: currentTheme === 'dark',
  };
};