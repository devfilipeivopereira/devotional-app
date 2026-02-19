import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/lib/useTheme";
import type { ThemePreference } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useNotifications, formatTime, type ReminderTime } from "@/lib/notifications-context";
import { useResponsiveWeb } from "@/lib/useResponsiveWeb";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";

function TimePickerModal({
  visible,
  onClose,
  onConfirm,
  initialHour,
  initialMinute,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (hour: number, minute: number) => void;
  initialHour: number;
  initialMinute: number;
}) {
  const { theme, palette } = useTheme();
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  const adjustHour = useCallback((delta: number) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setHour((prev) => {
      const next = prev + delta;
      if (next < 0) return 23;
      if (next > 23) return 0;
      return next;
    });
  }, []);

  const adjustMinute = useCallback((delta: number) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setMinute((prev) => {
      const next = prev + delta;
      if (next < 0) return 55;
      if (next > 55) return 0;
      return next;
    });
  }, []);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor: theme.card }]}
          onPress={() => {}}
        >
          <Text style={[styles.modalTitle, { color: theme.text, fontFamily: "Nunito_700Bold" }]}>
            Escolher Horário
          </Text>

          <View style={styles.timePickerRow}>
            <View style={styles.timeColumn}>
              <Pressable onPress={() => adjustHour(1)} style={styles.timeArrow} hitSlop={12}>
                <Ionicons name="chevron-up" size={28} color={palette.teal} />
              </Pressable>
              <Text style={[styles.timeValue, { color: theme.text }]}>
                {hour.toString().padStart(2, "0")}
              </Text>
              <Pressable onPress={() => adjustHour(-1)} style={styles.timeArrow} hitSlop={12}>
                <Ionicons name="chevron-down" size={28} color={palette.teal} />
              </Pressable>
            </View>

            <Text style={[styles.timeSeparator, { color: theme.textSecondary }]}>:</Text>

            <View style={styles.timeColumn}>
              <Pressable onPress={() => adjustMinute(5)} style={styles.timeArrow} hitSlop={12}>
                <Ionicons name="chevron-up" size={28} color={palette.teal} />
              </Pressable>
              <Text style={[styles.timeValue, { color: theme.text }]}>
                {minute.toString().padStart(2, "0")}
              </Text>
              <Pressable onPress={() => adjustMinute(-5)} style={styles.timeArrow} hitSlop={12}>
                <Ionicons name="chevron-down" size={28} color={palette.teal} />
              </Pressable>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onClose}
              style={[styles.modalBtn, { borderColor: theme.border }]}
            >
              <Text style={[styles.modalBtnText, { color: theme.textSecondary }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onConfirm(hour, minute);
              }}
              style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: palette.teal }]}
            >
              <Text style={[styles.modalBtnText, { color: "#fff" }]}>Confirmar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ReminderCard({
  reminder,
  index,
  onToggle,
  onEdit,
  onRemove,
  canRemove,
}: {
  reminder: ReminderTime;
  index: number;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { theme, palette } = useTheme();

  const timeStr = formatTime(reminder.hour, reminder.minute);
  const label =
    reminder.hour < 12 ? "Manhã" : reminder.hour < 18 ? "Tarde" : "Noite";

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
      <Pressable
        onPress={onEdit}
        style={[
          styles.reminderCard,
          {
            backgroundColor: theme.card,
            borderColor: reminder.enabled ? palette.teal + "30" : theme.border,
          },
        ]}
      >
        <View style={styles.reminderLeft}>
          <View
            style={[
              styles.reminderIcon,
              {
                backgroundColor: reminder.enabled
                  ? palette.teal + "18"
                  : theme.border + "60",
              },
            ]}
          >
            <Ionicons
              name={
                reminder.hour < 12
                  ? "sunny"
                  : reminder.hour < 18
                  ? "partly-sunny"
                  : "moon"
              }
              size={20}
              color={reminder.enabled ? palette.teal : theme.textSecondary}
            />
          </View>
          <View>
            <Text
              style={[
                styles.reminderTime,
                {
                  color: reminder.enabled ? theme.text : theme.textSecondary,
                  fontFamily: "Nunito_700Bold",
                },
              ]}
            >
              {timeStr}
            </Text>
            <Text style={[styles.reminderLabel, { color: theme.textSecondary }]}>
              {label}
            </Text>
          </View>
        </View>

        <View style={styles.reminderRight}>
          {canRemove && (
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web")
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRemove();
              }}
              hitSlop={10}
              style={styles.removeBtn}
            >
              <Ionicons name="trash-outline" size={18} color={palette.danger} />
            </Pressable>
          )}
          <Switch
            value={reminder.enabled}
            onValueChange={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              onToggle();
            }}
            trackColor={{ false: theme.border, true: palette.teal + "50" }}
            thumbColor={reminder.enabled ? palette.teal : theme.textSecondary}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "light", label: "Claro", icon: "sunny-outline" },
  { value: "dark", label: "Escuro", icon: "moon-outline" },
  { value: "system", label: "Seguir sistema", icon: "phone-portrait-outline" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, palette, preference, setThemePreference } = useTheme();
  const { user, signOut } = useAuth();
  const { isWeb } = useResponsiveWeb();
  const {
    settings,
    hasPermission,
    toggleEnabled,
    addReminder,
    removeReminder,
    toggleReminder,
    updateReminder,
  } = useNotifications();

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderTime | null>(null);
  const isConfirmingRef = useRef(false);

  const handleAddReminder = useCallback(() => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingReminder(null);
    setShowTimePicker(true);
  }, []);

  const handleEditReminder = useCallback((reminder: ReminderTime) => {
    setEditingReminder(reminder);
    setShowTimePicker(true);
  }, []);

  const handleTimeConfirm = useCallback(
    async (hour: number, minute: number) => {
      if (isConfirmingRef.current) return;
      isConfirmingRef.current = true;
      const reminderToEdit = editingReminder;
      setShowTimePicker(false);
      setEditingReminder(null);
      try {
        if (reminderToEdit) {
          await updateReminder(reminderToEdit.id, hour, minute);
        } else {
          await addReminder(hour, minute);
        }
      } finally {
        isConfirmingRef.current = false;
      }
    },
    [editingReminder, updateReminder, addReminder]
  );

  const topPadding = isWeb ? 67 : insets.top;

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topPadding + 16,
            paddingBottom: isWeb ? 34 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={[styles.title, { color: theme.text, fontFamily: "Nunito_800ExtraBold" }]}>
            Configurações
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text, fontFamily: "Nunito_700Bold" },
            ]}
          >
            Lembretes
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: palette.teal + "18" },
                  ]}
                >
                  <Ionicons name="notifications" size={20} color={palette.teal} />
                </View>
                <View style={styles.settingTextWrap}>
                  <Text
                    style={[
                      styles.settingLabel,
                      { color: theme.text, fontFamily: "Nunito_600SemiBold" },
                    ]}
                  >
                    Lembretes Diários
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {settings.enabled
                      ? `${settings.reminders.filter((r) => r.enabled).length} lembrete(s) ativo(s)`
                      : "Desativados"}
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  toggleEnabled();
                }}
                trackColor={{ false: theme.border, true: palette.teal + "50" }}
                thumbColor={settings.enabled ? palette.teal : theme.textSecondary}
              />
            </View>

            {Platform.OS !== "web" && !hasPermission && settings.enabled && (
              <View
                style={[
                  styles.warningBanner,
                  { backgroundColor: palette.warning + "15" },
                ]}
              >
                <Ionicons name="warning" size={16} color={palette.warning} />
                <Text style={[styles.warningText, { color: palette.warning }]}>
                  Permissão de notificação não concedida
                </Text>
              </View>
            )}

            {Platform.OS === "web" && (
              <View
                style={[
                  styles.infoBanner,
                  { backgroundColor: palette.teal + "10" },
                ]}
              >
                <Ionicons name="information-circle" size={16} color={palette.teal} />
                <Text style={[styles.infoText, { color: palette.teal }]}>
                  Notificações funcionam no dispositivo móvel
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {settings.enabled && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, fontFamily: "Nunito_700Bold" },
                ]}
              >
                Horários
              </Text>
              <Pressable
                onPress={handleAddReminder}
                style={[styles.addBtn, { backgroundColor: palette.teal + "18" }]}
                hitSlop={8}
              >
                <Ionicons name="add" size={22} color={palette.teal} />
              </Pressable>
            </View>

            <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>
              Toque para editar o horário
            </Text>

            {settings.reminders.map((reminder, index) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                index={index}
                onToggle={() => toggleReminder(reminder.id)}
                onEdit={() => handleEditReminder(reminder)}
                onRemove={() => removeReminder(reminder.id)}
                canRemove={settings.reminders.length > 1}
              />
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text, fontFamily: "Nunito_700Bold", marginTop: 28 },
            ]}
          >
            Aparência
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {THEME_OPTIONS.map((option, idx) => (
              <Pressable
                key={option.value}
                onPress={async () => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  await setThemePreference(option.value);
                }}
                style={[
                  styles.themeOption,
                  idx < THEME_OPTIONS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIcon,
                      {
                        backgroundColor:
                          preference === option.value
                            ? palette.teal + "18"
                            : theme.border + "40",
                      },
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={
                        preference === option.value ? palette.teal : theme.textSecondary
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.settingLabel,
                      {
                        color: preference === option.value ? palette.teal : theme.text,
                        fontFamily: "Nunito_600SemiBold",
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
                {preference === option.value && (
                  <Ionicons name="checkmark-circle" size={22} color={palette.teal} />
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {isSupabaseConfigured && user && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: "Nunito_700Bold", marginTop: 28 },
              ]}
            >
              Conta
            </Text>
            <Pressable
              onPress={async () => {
                await signOut();
                router.replace("/(auth)" as import("expo-router").Href);
              }}
              style={[
                styles.logoutBtn,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: palette.coral + "18" }]}>
                  <Ionicons name="log-out-outline" size={20} color={palette.coral} />
                </View>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: palette.coral, fontFamily: "Nunito_600SemiBold" },
                  ]}
                >
                  Sair
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </Pressable>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <View style={[styles.aboutCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.aboutTitle, { color: theme.text, fontFamily: "Nunito_700Bold" }]}>
              HabitFlow
            </Text>
            <Text style={[styles.aboutVersion, { color: theme.textSecondary }]}>
              Versão 1.0.0
            </Text>
            <Text style={[styles.aboutDesc, { color: theme.textSecondary }]}>
              Construa hábitos saudáveis, um dia de cada vez.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {showTimePicker && (
        <TimePickerModal
          visible
          onClose={() => {
            setShowTimePicker(false);
            setEditingReminder(null);
          }}
          onConfirm={handleTimeConfirm}
          initialHour={editingReminder?.hour ?? 9}
          initialMinute={editingReminder?.minute ?? 0}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 12,
  },
  sectionHint: {
    fontSize: 13,
    marginBottom: 12,
    marginTop: -4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingTextWrap: { flex: 1 },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  warningText: { fontSize: 13, flex: 1 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  infoText: { fontSize: 13, flex: 1 },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  reminderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reminderIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderTime: {
    fontSize: 20,
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  reminderLabel: {
    fontSize: 13,
    marginTop: 1,
  },
  reminderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  removeBtn: { padding: 6 },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  aboutCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    marginTop: 28,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  aboutVersion: {
    fontSize: 13,
    marginTop: 4,
  },
  aboutDesc: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 24,
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  timeColumn: {
    alignItems: "center",
    gap: 8,
  },
  timeArrow: { padding: 4 },
  timeValue: {
    fontSize: 42,
    fontWeight: "800" as const,
    letterSpacing: 2,
    minWidth: 60,
    textAlign: "center",
  },
  timeSeparator: {
    fontSize: 36,
    fontWeight: "700" as const,
    marginTop: -6,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  modalBtnPrimary: { borderWidth: 0 },
  modalBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
