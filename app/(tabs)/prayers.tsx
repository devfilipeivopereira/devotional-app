import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type PrayerRequest = {
  id: string;
  request_text: string;
  request_date: string;
  is_answered: boolean;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
};

function todayAsIsoDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function PrayersScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [items, setItems] = React.useState<PrayerRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [prayerTable, setPrayerTable] = React.useState<"prayer_requests" | "public_prayers">("prayer_requests");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [requestText, setRequestText] = React.useState("");
  const [requestDate, setRequestDate] = React.useState(todayAsIsoDate());

  const resolvePrayerTable = React.useCallback(async () => {
    const primary = await supabase.from("prayer_requests").select("id").limit(1);
    if (!primary.error) {
      setPrayerTable("prayer_requests");
      return "prayer_requests" as const;
    }
    const fallback = await supabase.from("public_prayers").select("id").limit(1);
    if (!fallback.error) {
      setPrayerTable("public_prayers");
      return "public_prayers" as const;
    }
    return "prayer_requests" as const;
  }, []);

  const loadRequests = React.useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const table = await resolvePrayerTable();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", user.id)
      .order("request_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Erro", error.message);
      setItems([]);
    } else {
      setItems((data ?? []) as PrayerRequest[]);
    }
    setLoading(false);
  }, [user, resolvePrayerTable]);

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const openCreate = () => {
    setEditingId(null);
    setRequestText("");
    setRequestDate(todayAsIsoDate());
    setModalOpen(true);
  };

  const openEdit = (item: PrayerRequest) => {
    setEditingId(item.id);
    setRequestText(item.request_text);
    setRequestDate(item.request_date);
    setModalOpen(true);
  };

  const saveRequest = async () => {
    if (!user) {
      Alert.alert("Acesso", "Voce precisa estar logado.");
      return;
    }
    if (!requestText.trim()) {
      Alert.alert("Pedido vazio", "Digite o pedido de oracao.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestDate)) {
      Alert.alert("Data invalida", "Use o formato AAAA-MM-DD.");
      return;
    }

    setSaving(true);
    if (editingId) {
      const { error } = await supabase
        .from(prayerTable)
        .update({
          request_text: requestText.trim(),
          request_date: requestDate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
        .eq("user_id", user.id);
      if (error) {
        Alert.alert("Erro", error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from(prayerTable).insert({
        user_id: user.id,
        request_text: requestText.trim(),
        request_date: requestDate,
      });
      if (error) {
        Alert.alert("Erro", error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setModalOpen(false);
    await loadRequests();
  };

  const toggleAnswered = async (item: PrayerRequest) => {
    if (!user) return;
    const nextAnswered = !item.is_answered;
    const { error } = await supabase
      .from(prayerTable)
      .update({
        is_answered: nextAnswered,
        answered_at: nextAnswered ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("user_id", user.id);
    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }
    await loadRequests();
  };

  const deleteRequest = async (item: PrayerRequest) => {
    if (!user) return;
    Alert.alert("Excluir pedido", "Deseja realmente excluir este pedido?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from(prayerTable)
            .delete()
            .eq("id", item.id)
            .eq("user_id", user.id);
          if (error) {
            Alert.alert("Erro", error.message);
            return;
          }
          await loadRequests();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Oracoes</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Seus pedidos de oracao com acompanhamento de resposta
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.palette.coral} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🙏</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Sem pedidos ainda</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Toque no botão para cadastrar seu primeiro pedido.
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <View key={item.id} style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.dateText, { color: Colors.palette.coral }]}>
                    {item.request_date}
                  </Text>
                  <View style={styles.row}>
                    <Pressable onPress={() => openEdit(item)} hitSlop={8}>
                      <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
                    </Pressable>
                    <Pressable onPress={() => deleteRequest(item)} hitSlop={8} style={{ marginLeft: 12 }}>
                      <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </View>

                <Text style={[styles.requestText, { color: theme.text }]}>{item.request_text}</Text>

                <Pressable style={styles.answerRow} onPress={() => toggleAnswered(item)}>
                  <Ionicons
                    name={item.is_answered ? "checkbox" : "square-outline"}
                    size={22}
                    color={item.is_answered ? Colors.palette.coral : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.answerText,
                      { color: item.is_answered ? Colors.palette.coral : theme.textSecondary },
                    ]}
                  >
                    Resposta confirmada
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Pressable style={[styles.fab, { backgroundColor: Colors.palette.coral }]} onPress={openCreate}>
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={20}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.card,
                marginBottom: Math.max(insets.bottom, 12) + 12,
                paddingBottom: Math.max(insets.bottom, 12) + 10,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingId ? "Editar pedido" : "Novo pedido de oracao"}
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Data do pedido (AAAA-MM-DD)</Text>
            <TextInput
              value={requestDate}
              onChangeText={setRequestDate}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
              placeholder="2026-02-19"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Pedido</Text>
            <TextInput
              multiline
              value={requestText}
              onChangeText={setRequestText}
              style={[
                styles.input,
                styles.multiline,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
              placeholder="Escreva seu pedido de oracao..."
              placeholderTextColor={theme.textSecondary}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.btn, { backgroundColor: theme.background }]} onPress={() => setModalOpen(false)}>
                <Text style={[styles.btnText, { color: theme.text }]}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, { backgroundColor: Colors.palette.coral }]} onPress={saveRequest} disabled={saving}>
                <Text style={[styles.btnText, { color: "#fff" }]}>{saving ? "Salvando..." : "Salvar"}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: 28,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  answerText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 36,
  },
  modalCard: {
    borderRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 16,
    minHeight: 420,
    maxHeight: "88%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  multiline: {
    minHeight: 120,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
    gap: 10,
  },
  btn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
