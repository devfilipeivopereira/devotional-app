import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { HabitsProvider } from "@/lib/habits-context";
import { ThemeProvider } from "@/lib/ThemeContext";
import { AuthProvider } from "@/lib/AuthContext";

SplashScreen.preventAutoHideAsync();

const SPLASH_BG = "#120b2d";

function LoadingSplash() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.splash]}>
      <Text style={styles.splashTitle}>HabitFlow</Text>
    </View>
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Voltar" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="habit-form"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="habit-detail"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function ready() {
      await SplashScreen.hideAsync();
      setIsReady(true);
    }
    ready();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <GestureHandlerRootView style={styles.flex}>
              <KeyboardProvider>
                {!isReady ? (
                  <LoadingSplash />
                ) : (
                  <HabitsProvider>
                    <RootLayoutNav />
                  </HabitsProvider>
                )}
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
