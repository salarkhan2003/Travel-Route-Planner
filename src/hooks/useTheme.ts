import { useSettingsStore } from '../store/settingsStore';
import { getTheme, NC_LIGHT, NC_DARK } from '../constants/theme';

export function useTheme() {
  const darkMode = useSettingsStore(state => state.darkMode);
  return {
    theme: getTheme(darkMode),
    isDark: darkMode,
    NC: darkMode ? NC_DARK : NC_LIGHT,
  };
}
