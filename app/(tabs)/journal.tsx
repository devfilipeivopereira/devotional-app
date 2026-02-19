import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";
import Colors from "@/constants/colors";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

type FilterTab = "all" | "highlights" | "notes";

type DayOption = {
  id: string;
  day_number: number;
  title: string;
  devotional_series?: { title: string } | null;
};

type JournalEntry = {
  id: string;
  day_id: string;
  block_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  devotional_days?: DayOption | null;
};

export default function JournalScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = React.useState<FilterTab>("all");
  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [days, setDays] = React.useState<DayOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = React.useState<string>("");
  const [content, setContent] = React.useState("");

  const tabs = [
    { key: "all" as const, label: "Tudo" },
    { key: "highlights" as const, label: "Destaques" },
    { key: "notes" as const, label: "Anotacoes" },
  ];

  const loadData = React.useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [daysRes, entriesRes] = await Promise.all([
        supabase
          .from("devotional_days")
          .select("id, day_number, title, devotional_series(title)")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("devotional_journal")
          .select(
            "id, day_id, block_id, content, created_at, updated_at, devotional_days(id, day_number, title, devotional_series(title))"
          )
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
      ]);

      if (daysRes.error) throw daysRes.error;
      if (entriesRes.error) throw entriesRes.error;

      const fetchedDays: DayOption[] = (daysRes.data ?? []).map((row: any) => ({
        id: row.id,
        day_number: row.day_number,
        title: row.title,
        devotional_series: Array.isArray(row.devotional_series)
          ? row.devotional_series[0] ?? null
          : row.devotional_series ?? null,
      }));
      setDays(fetchedDays);
      if (!selectedDayId && fetchedDays[0]?.id) {
        setSelectedDayId(fetchedDays[0].id);
      }

      const fetchedEntries: JournalEntry[] = (entriesRes.data ?? []).map((row: any) => ({
        id: row.id,
        day_id: row.day_id,
        block_id: row.block_id,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        devotional_days: Array.isArray(row.devotional_days)
          ? (row.devotional_days[0]
              ? {
                  id: row.devotional_days[0].id,
                  day_number: row.devotional_days[0].day_number,
                  title: row.devotional_days[0].title,
                  devotional_series: Array.isArray(row.devotional_days[0].devotional_series)
                    ? row.devotional_days[0].devotional_series[0] ?? null
                    : row.devotional_days[0].devotional_series ?? null,
                }
              : null)
          : row.devotional_days ?? null,
      }));
      setEntries(fetchedEntries);
    } catch (err: any) {
      Alert.alert("Erro", err.message ?? "Falha ao carregar diario.");
    } finally {
      setLoading(false);
    }
  }, [selectedDayId, user]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredEntries = entries.filter((entry) => {
    if (activeTab === "highlights") return !!entry.block_id;
    if (activeTab === "notes") return !entry.block_id;
    return true;
  });

  const resetForm = () => {
    setEditingId(null);
    setContent("");
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setSelectedDayId(entry.day_id);
    setContent(entry.content);
    setModalOpen(true);
  };

  const saveEntry = async () => {
    if (!user) {
      Alert.alert("Acesso", "Voce precisa estar logado.");
      return;
    }
    if (!selectedDayId) {
      Alert.alert("Dia obrigatorio", "Selecione um dia para salvar a anotacao.");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Conteudo vazio", "Digite algo para salvar.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("devotional_journal")
          .update({
            day_id: selectedDayId,
            content: content.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("devotional_journal").insert({
          user_id: user.id,
          day_id: selectedDayId,
          block_id: null,
          content: content.trim(),
        });
        if (error) throw error;
      }

      setModalOpen(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      Alert.alert("Erro ao salvar", err.message ?? "Nao foi possivel salvar.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;
    Alert.alert("Excluir anotacao", "Deseja realmente excluir esta anotacao?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("devotional_journal")
              .delete()
              .eq("id", id)
              .eq("user_id", user.id);
            if (error) throw error;
            await loadData();
          } catch (err: any) {
            Alert.alert("Erro ao excluir", err.message ?? "Nao foi possivel excluir.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Diario</Text>

      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tabPill,
              activeTab === tab.key ? { borderColor: theme.text } : { borderColor: "transparent" },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? theme.text : theme.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.palette.coral} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📖</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Seu diario devocional</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Crie anotacoes para registrar o que Deus falou ao seu coracao.
              </Text>
            </View>
          ) : (
            filteredEntries.map((entry) => (
              <View key={entry.id} style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardDay, { color: Colors.palette.coral }]}>
                    Dia {entry.devotional_days?.day_number ?? "-"} - {entry.devotional_days?.title ?? "Sem titulo"}
                  </Text>
                  <View style={styles.row}>
                    <Pressable onPress={() => openEdit(entry)} hitSlop={8}>
                      <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
                    </Pressable>
                    <Pressable onPress={() => deleteEntry(entry.id)} hitSlop={8} style={{ marginLeft: 12 }}>
                      <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </View>
                {!!entry.devotional_days?.devotional_series?.title && (
                  <Text style={[styles.seriesText, { color: theme.textSecondary }]}>
                    Serie: {entry.devotional_days.devotional_series.title}
                  </Text>
                )}
                <Text style={[styles.cardContent, { color: theme.text }]}>{entry.content}</Text>
                <Text style={[styles.cardDate, { color: theme.textSecondary }]}>
                  {new Date(entry.updated_at ?? entry.created_at).toLocaleString("pt-BR")}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Pressable style={[styles.fab, { backgroundColor: Colors.palette.coral }]} onPress={openCreate}>
        <Ionicons name="pencil" size={24} color="#fff" />
      </Pressable>

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingId ? "Editar anotacao" : "Nova anotacao"}
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Dia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
              {days.map((day) => (
                <Pressable
                  key={day.id}
                  onPress={() => setSelectedDayId(day.id)}
                  style={[
                    styles.dayChip,
                    {
                      backgroundColor:
                        selectedDayId === day.id ? Colors.palette.coral : theme.background,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selectedDayId === day.id ? "#fff" : theme.text,
                      fontWeight: "600",
                    }}
                  >
                    Dia {day.day_number}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Anotacao</Text>
            <TextInput
              multiline
              value={content}
              onChangeText={setContent}
              placeholder="Escreva sua anotacao..."
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.btn, { backgroundColor: theme.background }]} onPress={() => setModalOpen(false)}>
                <Text style={[styles.btnText, { color: theme.text }]}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, { backgroundColor: Colors.palette.coral }]} onPress={saveEntry} disabled={saving}>
                <Text style={[styles.btnText, { color: "#fff" }]}>{saving ? "Salvando..." : "Salvar"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 64,
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
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDay: {
    fontSize: 13,
    fontWeight: "700",
  },
  seriesText: {
    fontSize: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  cardDate: {
    fontSize: 11,
    marginTop: 10,
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
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "80%",
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
  daysRow: {
    paddingBottom: 6,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    gap: 10,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
