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

type TabKey = "highlights" | "notes";

type BibleHighlight = {
  id: string;
  book_name: string;
  book_abbrev: string;
  chapter: number;
  verse_number: number;
  verse_text: string;
  created_at: string;
};

type UserNote = {
  id: string;
  title: string;
  description: string;
  note_date: string;
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

export default function JournalScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = React.useState<TabKey>("highlights");
  const [loading, setLoading] = React.useState(true);
  const [highlights, setHighlights] = React.useState<BibleHighlight[]>([]);
  const [notes, setNotes] = React.useState<UserNote[]>([]);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [noteDate, setNoteDate] = React.useState(todayAsIsoDate());

  const loadData = React.useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [hRes, nRes] = await Promise.all([
        supabase
          .from("bible_highlights")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_notes")
          .select("*")
          .eq("user_id", user.id)
          .order("note_date", { ascending: false })
          .order("updated_at", { ascending: false }),
      ]);

      if (hRes.error) throw hRes.error;
      if (nRes.error) throw nRes.error;

      setHighlights((hRes.data ?? []) as BibleHighlight[]);
      setNotes((nRes.data ?? []) as UserNote[]);
    } catch (err: any) {
      Alert.alert("Erro", err.message ?? "Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateNote = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setNoteDate(todayAsIsoDate());
    setModalOpen(true);
  };

  const openEditNote = (note: UserNote) => {
    setEditingId(note.id);
    setTitle(note.title);
    setDescription(note.description);
    setNoteDate(note.note_date);
    setModalOpen(true);
  };

  const saveNote = async () => {
    if (!user) {
      Alert.alert("Acesso", "Faça login para salvar anotações.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Título obrigatório", "Informe um título.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Descrição obrigatória", "Informe uma descrição.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(noteDate)) {
      Alert.alert("Data inválida", "Use o formato AAAA-MM-DD.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("user_notes")
          .update({
            title: title.trim(),
            description: description.trim(),
            note_date: noteDate,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_notes").insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          note_date: noteDate,
        });
        if (error) throw error;
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      Alert.alert("Erro", err.message ?? "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    Alert.alert("Excluir anotação", "Deseja excluir esta anotação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("user_notes")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);
          if (error) {
            Alert.alert("Erro", error.message);
            return;
          }
          await loadData();
        },
      },
    ]);
  };

  const removeHighlight = async (item: BibleHighlight) => {
    if (!user) return;
    const { error } = await supabase
      .from("bible_highlights")
      .delete()
      .eq("id", item.id)
      .eq("user_id", user.id);
    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }
    await loadData();
  };

  const emptyStateText =
    activeTab === "highlights"
      ? "Destaque versículos na aba Bíblia para vê-los aqui."
      : "Crie notas com título, descrição e data.";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Anotações</Text>

      <View style={styles.tabsRow}>
        <Pressable
          style={[styles.tabPill, activeTab === "highlights" ? { borderColor: theme.text } : { borderColor: "transparent" }]}
          onPress={() => setActiveTab("highlights")}
        >
          <Text style={[styles.tabText, { color: activeTab === "highlights" ? theme.text : theme.textSecondary }]}>
            Destaques
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabPill, activeTab === "notes" ? { borderColor: theme.text } : { borderColor: "transparent" }]}
          onPress={() => setActiveTab("notes")}
        >
          <Text style={[styles.tabText, { color: activeTab === "notes" ? theme.text : theme.textSecondary }]}>
            Anotações
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.palette.coral} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeTab === "highlights" ? (
            highlights.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📌</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{emptyStateText}</Text>
              </View>
            ) : (
              highlights.map((item) => (
                <View key={item.id} style={[styles.card, { backgroundColor: theme.card }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: Colors.palette.coral }]}>
                      {item.book_name} {item.chapter}:{item.verse_number}
                    </Text>
                    <Pressable onPress={() => removeHighlight(item)} hitSlop={8}>
                      <Ionicons name="bookmark" size={18} color="#C89D1D" />
                    </Pressable>
                  </View>
                  <Text style={[styles.cardDescription, { color: theme.text }]}>{item.verse_text}</Text>
                  <Text style={[styles.cardDate, { color: theme.textSecondary }]}>
                    {new Date(item.created_at).toLocaleString("pt-BR")}
                  </Text>
                </View>
              ))
            )
          ) : notes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🗒️</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{emptyStateText}</Text>
            </View>
          ) : (
            notes.map((item) => (
              <View key={item.id} style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                  <View style={styles.row}>
                    <Pressable onPress={() => openEditNote(item)} hitSlop={8}>
                      <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
                    </Pressable>
                    <Pressable onPress={() => deleteNote(item.id)} hitSlop={8} style={{ marginLeft: 12 }}>
                      <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </View>
                <Text style={[styles.cardDescription, { color: theme.text }]}>{item.description}</Text>
                <Text style={[styles.cardDate, { color: Colors.palette.coral }]}>Data: {item.note_date}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {activeTab === "notes" && (
        <Pressable style={[styles.fab, { backgroundColor: Colors.palette.coral }]} onPress={openCreateNote}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      )}

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
              {editingId ? "Editar anotação" : "Nova anotação"}
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Pedido de oração pela família"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Data (AAAA-MM-DD)</Text>
            <TextInput
              value={noteDate}
              onChangeText={setNoteDate}
              placeholder="2026-02-19"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              autoCapitalize="none"
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Descrição</Text>
            <TextInput
              multiline
              value={description}
              onChangeText={setDescription}
              placeholder="Escreva sua anotação..."
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                styles.multiline,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.btn, { backgroundColor: theme.background }]} onPress={() => setModalOpen(false)}>
                <Text style={[styles.btnText, { color: theme.text }]}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, { backgroundColor: Colors.palette.coral }]} onPress={saveNote} disabled={saving}>
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
    fontSize: 56,
    marginBottom: 16,
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
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  cardDate: {
    fontSize: 12,
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
    paddingHorizontal: 12,
    paddingTop: 36,
  },
  modalCard: {
    borderRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 16,
    minHeight: 440,
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
