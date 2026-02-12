import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/lib/useTheme";
import type { ThemePreference } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  useFonts,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_400Regular,
} from "@expo-google-fonts/nunito";

const OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "light", label: "Claro", icon: "sunny-outline" },
  { value: "dark", label: "Escuro", icon: "moon-outline" },
  { value: "system", label: "Seguir sistema", icon: "phone-portrait-outline" },
];

export default function SettingsScreen() {
  const { theme, palette, preference, setThemePreference } = useTheme();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: (Platform.OS !== "web" ? insets.top : webTopInset) + 16,
          paddingBottom: 100,
        }}
      >
        <Text
          style={[
            styles.title,
            { color: theme.text, fontFamily: "Nunito_700Bold" },
          ]}
        >
          Aparência
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.textSecondary, fontFamily: "Nunito_400Regular" },
          ]}
        >
          Escolha o tema do app
        </Text>

        <View style={styles.options}>
          {OPTIONS.map((opt) => {
            const selected = preference === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setThemePreference(opt.value)}
                style={[
                  styles.option,
                  {
                    backgroundColor: theme.card,
                    borderColor: selected ? palette.teal : theme.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: palette.teal + "18" },
                  ]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={22}
                    color={selected ? palette.teal : theme.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: theme.text,
                      fontFamily: "Nunito_600SemiBold",
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {selected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={palette.teal}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {isSupabaseConfigured && user && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: "Nunito_700Bold" },
              ]}
            >
              Conta
            </Text>
            <Pressable
              onPress={async () => {
                await signOut();
                router.replace("/(auth)");
              }}
              style={[styles.option, styles.logout, { backgroundColor: theme.card }]}
            >
              <View style={[styles.optionIcon, { backgroundColor: palette.coral + "18" }]}>
                <Ionicons name="log-out-outline" size={22} color={palette.coral} />
              </View>
              <Text style={[styles.optionLabel, { color: palette.coral, fontFamily: "Nunito_600SemiBold" }]}>
                Sair
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, marginHorizontal: 20, marginBottom: 4 },
  subtitle: { fontSize: 14, marginHorizontal: 20, marginBottom: 24 },
  options: { paddingHorizontal: 20, gap: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: { flex: 1, fontSize: 16 },
  sectionTitle: { fontSize: 20, marginHorizontal: 20, marginTop: 32, marginBottom: 12 },
  logout: { marginHorizontal: 20 },
});
