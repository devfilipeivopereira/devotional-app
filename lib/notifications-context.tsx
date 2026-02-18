import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ReminderTime {
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
}

interface NotificationSettings {
  enabled: boolean;
  reminders: ReminderTime[];
}

interface NotificationsContextValue {
  settings: NotificationSettings;
  isLoading: boolean;
  hasPermission: boolean;
  toggleEnabled: () => Promise<void>;
  addReminder: (hour: number, minute: number) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  updateReminder: (id: string, hour: number, minute: number) => Promise<void>;
  rescheduleAll: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const STORAGE_KEY = "@habitflow_notification_settings";

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  reminders: [
    { id: "default_morning", hour: 8, minute: 0, enabled: true },
    { id: "default_evening", hour: 20, minute: 0, enabled: true },
  ],
};

const REMINDER_MESSAGES = [
  "Hora de conferir seus hábitos de hoje!",
  "Não esqueça dos seus hábitos!",
  "Seus hábitos estão esperando por você!",
  "Mantenha sua sequência! Confira seus hábitos.",
  "Um passo de cada vez. Veja seus hábitos de hoje.",
  "Consistência é a chave! Abra o HabitFlow.",
];

function getRandomMessage(): string {
  return REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

async function cancelAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function scheduleReminders(settings: NotificationSettings): Promise<void> {
  await cancelAllScheduled();

  if (!settings.enabled) return;
  if (Platform.OS === "web") return;

  const activeReminders = settings.reminders.filter((r) => r.enabled);

  for (const reminder of activeReminders) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "HabitFlow",
        body: getRandomMessage(),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
      },
    });
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (Platform.OS !== "web") {
          const { status } = await Notifications.getPermissionsAsync();
          setHasPermission(status === "granted");
        }
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as NotificationSettings;
          setSettings(parsed);
        }
      } catch (e) {
        console.error("Error loading notification settings:", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const persist = useCallback(async (newSettings: NotificationSettings) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    await scheduleReminders(newSettings);
  }, []);

  const toggleEnabled = useCallback(async () => {
    if (!settings.enabled && Platform.OS !== "web") {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          "Permissão Necessária",
          "Para receber lembretes, ative as notificações nas configurações do dispositivo.",
          [{ text: "OK" }]
        );
        return;
      }
      setHasPermission(true);
    }

    const updated = { ...settings, enabled: !settings.enabled };
    setSettings(updated);
    await persist(updated);
  }, [settings, persist]);

  const addReminder = useCallback(
    async (hour: number, minute: number) => {
      const newReminder: ReminderTime = {
        id: generateId(),
        hour,
        minute,
        enabled: true,
      };
      const updated = {
        ...settings,
        reminders: [...settings.reminders, newReminder].sort(
          (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)
        ),
      };
      setSettings(updated);
      await persist(updated);
    },
    [settings, persist]
  );

  const removeReminder = useCallback(
    async (id: string) => {
      if (settings.reminders.length <= 1) {
        Alert.alert("Aviso", "Mantenha pelo menos um horário de lembrete.");
        return;
      }
      const updated = {
        ...settings,
        reminders: settings.reminders.filter((r) => r.id !== id),
      };
      setSettings(updated);
      await persist(updated);
    },
    [settings, persist]
  );

  const toggleReminder = useCallback(
    async (id: string) => {
      const updated = {
        ...settings,
        reminders: settings.reminders.map((r) =>
          r.id === id ? { ...r, enabled: !r.enabled } : r
        ),
      };
      setSettings(updated);
      await persist(updated);
    },
    [settings, persist]
  );

  const updateReminder = useCallback(
    async (id: string, hour: number, minute: number) => {
      const updated = {
        ...settings,
        reminders: settings.reminders
          .map((r) => (r.id === id ? { ...r, hour, minute } : r))
          .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute)),
      };
      setSettings(updated);
      await persist(updated);
    },
    [settings, persist]
  );

  const rescheduleAll = useCallback(async () => {
    await scheduleReminders(settings);
  }, [settings]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      settings,
      isLoading,
      hasPermission,
      toggleEnabled,
      addReminder,
      removeReminder,
      toggleReminder,
      updateReminder,
      rescheduleAll,
    }),
    [settings, isLoading, hasPermission, toggleEnabled, addReminder, removeReminder, toggleReminder, updateReminder, rescheduleAll]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

export { formatTime };
