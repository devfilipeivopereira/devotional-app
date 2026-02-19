import React, { useState } from "react";
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
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/lib/useTheme";
import { useAuth } from "@/lib/AuthContext";
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_400Regular } from "@expo-google-fonts/nunito";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COPYRIGHT_URL = "https://www.filipeivopereira.com";

export default function SignupScreen() {
  const { theme, palette } = useTheme();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });

  const handleSignUp = async () => {
    setError("");
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) {
      setError("Preencha nome, e-mail e senha.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Digite um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(trimmedName, trimmedEmail, password);
    setLoading(false);
    if (err) {
      setError(err);
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
          Criar conta
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: "Nunito_400Regular" }]}>
          Nome, e-mail e senha para acessar o app
        </Text>

        <TextInput
          placeholder="Nome"
          placeholderTextColor={theme.textSecondary}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
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
          placeholder="E-mail"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
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
          placeholder="Senha (mín. 6 caracteres)"
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
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
          onPress={handleSignUp}
          disabled={loading}
          style={[styles.button, { backgroundColor: palette.coral }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { fontFamily: "Nunito_600SemiBold" }]}>
              Cadastrar
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(auth)")}
          style={styles.linkWrap}
        >
          <Text style={[styles.link, { color: theme.textSecondary, fontFamily: "Nunito_400Regular" }]}>
            Já tem conta?{" "}
            <Text style={[styles.linkBold, { color: palette.coral, fontFamily: "Nunito_600SemiBold" }]}>
              Entrar
            </Text>
          </Text>
        </Pressable>

        {Platform.OS !== "web" && (
          <Pressable
            style={styles.footer}
            onPress={() => Linking.openURL(COPYRIGHT_URL)}
          >
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              © Filipe Ivo Pereira
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    minHeight: 400,
  },
  title: { fontSize: 28, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 32 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { fontSize: 14, marginBottom: 8, textAlign: "center" },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  linkWrap: { marginTop: 24, alignItems: "center" },
  link: { fontSize: 14 },
  linkBold: { fontSize: 14 },
  footer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
