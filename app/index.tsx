import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

const SPLASH_BG = "#1A1A2E";

export default function IndexScreen() {
  const { session, isLoading, pendingPasswordReset } = useAuth();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      router.replace("/(tabs)");
      return;
    }
    if (isLoading) return;
    if (pendingPasswordReset) {
      router.replace("/(auth)/reset-password");
      return;
    }
    if (session) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)");
    }
  }, [isSupabaseConfigured, session, isLoading, pendingPasswordReset]);

  return (
    <View style={[StyleSheet.absoluteFill, styles.splash]}>
      <Text style={styles.splashTitle}>Devocional</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    backgroundColor: SPLASH_BG,
    justifyContent: "center",
    alignItems: "center",
  },
  splashTitle: {
    color: "#ffffff",
    fontSize: 14,
  },
});
