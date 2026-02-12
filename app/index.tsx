import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

const SPLASH_BG = "#120b2d";

export default function IndexScreen() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      router.replace("/(tabs)");
      return;
    }
    if (isLoading) return;
    if (session) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)");
    }
  }, [isSupabaseConfigured, session, isLoading]);

  return (
    <View style={[StyleSheet.absoluteFill, styles.splash]}>
      <Text style={styles.splashTitle}>HabitFlow</Text>
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
