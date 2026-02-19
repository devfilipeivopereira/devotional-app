import { useContext } from "react";
import { useColorScheme } from "react-native";
import Colors from "@/constants/colors";
import { ThemeContext } from "@/lib/ThemeContext";

export function useTheme() {
  const ctx = useContext(ThemeContext);
  const colorScheme = useColorScheme();

  if (ctx) {
    return {
      theme: ctx.theme,
      isDark: ctx.isDark,
      palette: ctx.palette,

      preference: ctx.preference,
      setThemePreference: ctx.setPreference,
    };
  }

  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  return {
    theme,
    isDark,
    palette: Colors.palette,

    preference: "system" as const,
    setThemePreference: async (_p: "light" | "dark" | "system") => { },
  };
}
