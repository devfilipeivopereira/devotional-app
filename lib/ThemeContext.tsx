import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "@devocional_theme";

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => Promise<void>;
  isDark: boolean;
  theme: typeof Colors.light;
  palette: typeof Colors.palette;

};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === "light" || value === "dark" || value === "system") {
        setPreferenceState(value);
      }
      setLoaded(true);
    });
  }, []);

  const setPreference = async (p: ThemePreference) => {
    setPreferenceState(p);
    await AsyncStorage.setItem(STORAGE_KEY, p);
  };

  const isDark = useMemo(() => {
    if (preference === "system") return systemScheme === "dark";
    return preference === "dark";
  }, [preference, systemScheme]);

  const theme = isDark ? Colors.dark : Colors.light;

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      setPreference,
      isDark,
      theme,
      palette: Colors.palette,

    }),
    [preference, isDark, theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={theme.background}
        translucent={false}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
