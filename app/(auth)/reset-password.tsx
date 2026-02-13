import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/lib/useTheme";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_400Regular } from "@expo-google-fonts/nunito";

const MIN_PASSWORD_LENGTH = 6;

function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!hash || hash.charAt(0) === "#") hash = hash.slice(1);
  hash.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key && value) params[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return params;
}

export default function ResetPasswordScreen() {
  const { theme, palette } = useTheme();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hashHandled, setHashHandled] = useState(Platform.OS !== "web");
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });

  useEffect(() => {
    if (Platform.OS !== "web" || !isSupabaseConfigured || hashHandled) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const params = parseHashParams(hash);
    const access_token = params.access_token;
    const refresh_token = params.refresh_token;
    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(() => {
        if (typeof window !== "undefined" && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        setHashHandled(true);
      });
    } else {
      setHashHandled(true);
    }
  }, [hashHandled]);

  const handleSubmit = async () => {
    setError("");
    if (!password.trim()) {
      setError("Digite a nova senha.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!isSupabaseConfigured) {
      setError("Configuração indisponível.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: password.trim() });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      router.replace("/(tabs)");
    }
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text, fontFamily: "Nunito_700Bold" }]}>
          Nova senha
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: "Nunito_400Regular" }]}>
          Digite e confirme sua nova senha (mínimo 6 caracteres).
        </Text>

        <TextInput
          placeholder="Nova senha"
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
        />
        <TextInput
          placeholder="Confirmar nova senha"
          placeholderTextColor={theme.textSecondary}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          editable={!loading}
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
        />
        {error ? (
          <Text style={[styles.error, { color: palette.coral }]}>{error}</Text>
        ) : null}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.button, { backgroundColor: palette.teal }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { fontFamily: "Nunito_600SemiBold" }]}>
              Redefinir senha
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: { fontSize: 28, marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { fontSize: 14, marginBottom: 8 },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16 },
});
