import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  frequency: "daily" | "weekdays" | "weekends" | "custom";
  customDays?: number[];
  createdAt: string;
  reminder?: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string;
}

interface HabitsContextValue {
  habits: Habit[];
  completions: HabitCompletion[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => Promise<void>;
  updateHabit: (
    id: string,
    updates: Partial<Omit<Habit, "id" | "createdAt">>
  ) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
  isCompleted: (habitId: string, date: string) => boolean;
  getStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days: number) => number;
  getHabitsForDate: (date: string) => Habit[];
  getCompletedCount: (date: string) => number;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

const HABITS_KEY = "@habitflow_habits";
const COMPLETIONS_KEY = "@habitflow_completions";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + "T12:00:00").getDay();
}

// Mapear linha do Supabase -> Habit
function mapRowToHabit(row: {
  id: string;
  name: string;
  color: string;
  icon: string;
  frequency: string;
  custom_days: number[] | null;
  reminder: string | null;
  created_at: string;
}): Habit {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    frequency: row.frequency as Habit["frequency"],
    customDays: row.custom_days ?? undefined,
    createdAt: row.created_at,
    reminder: row.reminder ?? undefined,
  };
}

// Mapear linha do Supabase -> HabitCompletion
function mapRowToCompletion(row: {
  habit_id: string;
  date: string;
}): HabitCompletion {
  const d = row.date;
  const dateStr = typeof d === "string" ? d.split("T")[0] : d;
  return { habitId: row.habit_id, date: dateStr };
}

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    if (isSupabaseConfigured) {
      if (!user) {
        setHabits([]);
        setCompletions([]);
        setIsLoading(false);
        return;
      }
      try {
        const [habitsRes, completionsRes] = await Promise.all([
          supabase.from("habits").select("*").order("created_at", { ascending: true }),
          supabase.from("habit_completions").select("habit_id, date"),
        ]);
        if (habitsRes.error) throw habitsRes.error;
        if (completionsRes.error) throw completionsRes.error;
        setHabits((habitsRes.data ?? []).map(mapRowToHabit));
        setCompletions((completionsRes.data ?? []).map(mapRowToCompletion));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erro ao carregar dados";
        setError(message);
        console.error("Supabase load error:", e);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const [habitsData, completionsData] = await Promise.all([
          AsyncStorage.getItem(HABITS_KEY),
          AsyncStorage.getItem(COMPLETIONS_KEY),
        ]);
        if (habitsData) setHabits(JSON.parse(habitsData));
        if (completionsData) setCompletions(JSON.parse(completionsData));
      } catch (e) {
        console.error("AsyncStorage load error:", e);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addHabit = useCallback(
    async (habitData: Omit<Habit, "id" | "createdAt">) => {
      if (isSupabaseConfigured) {
        if (!user) throw new Error("Usuário não autenticado");
        const customDaysPayload =
          habitData.frequency === "custom"
            ? (habitData.customDays && habitData.customDays.length > 0 ? habitData.customDays : null)
            : null;
        const { data, error: err } = await supabase
          .from("habits")
          .insert({
            user_id: user.id,
            name: habitData.name,
            color: habitData.color,
            icon: habitData.icon,
            frequency: habitData.frequency,
            custom_days: customDaysPayload,
            reminder: habitData.reminder ?? null,
          })
          .select()
          .single();
        if (err) throw err;
        if (data) setHabits((prev) => [...prev, mapRowToHabit(data)]);
      } else {
        const newHabit: Habit = {
          ...habitData,
          id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
          createdAt: new Date().toISOString(),
        };
        const updated = [...habits, newHabit];
        setHabits(updated);
        await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
      }
    },
    [habits, user]
  );

  const updateHabit = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Habit, "id" | "createdAt">>
    ) => {
      if (isSupabaseConfigured) {
        const updatePayload: Record<string, unknown> = {};
        if (updates.name !== undefined) updatePayload.name = updates.name;
        if (updates.color !== undefined) updatePayload.color = updates.color;
        if (updates.icon !== undefined) updatePayload.icon = updates.icon;
        if (updates.frequency !== undefined) {
          updatePayload.frequency = updates.frequency;
          updatePayload.custom_days =
            updates.frequency === "custom" && updates.customDays && updates.customDays.length > 0
              ? updates.customDays
              : null;
        } else if (updates.customDays !== undefined) {
          updatePayload.custom_days = updates.customDays;
        }
        if (updates.reminder !== undefined) updatePayload.reminder = updates.reminder;

        const { error: err } = await supabase
          .from("habits")
          .update(updatePayload)
          .eq("id", id);
        if (err) throw err;
        setHabits((prev) =>
          prev.map((h) =>
            h.id === id
              ? {
                  ...h,
                  ...updates,
                }
              : h
          )
        );
      } else {
        const updated = habits.map((h) =>
          h.id === id ? { ...h, ...updates } : h
        );
        setHabits(updated);
        await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
      }
    },
    [habits]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      if (isSupabaseConfigured) {
        const { error: err } = await supabase.from("habits").delete().eq("id", id);
        if (err) throw err;
        setHabits((prev) => prev.filter((h) => h.id !== id));
        setCompletions((prev) => prev.filter((c) => c.habitId !== id));
      } else {
        const updatedHabits = habits.filter((h) => h.id !== id);
        const updatedCompletions = completions.filter((c) => c.habitId !== id);
        setHabits(updatedHabits);
        setCompletions(updatedCompletions);
        await Promise.all([
          AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabits)),
          AsyncStorage.setItem(
            COMPLETIONS_KEY,
            JSON.stringify(updatedCompletions)
          ),
        ]);
      }
    },
    [habits, completions]
  );

  const toggleCompletion = useCallback(
    async (habitId: string, date: string) => {
      if (isSupabaseConfigured) {
        const existing = completions.some(
          (c) => c.habitId === habitId && c.date === date
        );
        if (existing) {
          const { error: err } = await supabase
            .from("habit_completions")
            .delete()
            .eq("habit_id", habitId)
            .eq("date", date);
          if (err) throw err;
          setCompletions((prev) =>
            prev.filter(
              (c) => !(c.habitId === habitId && c.date === date)
            )
          );
        } else {
          const { error: err } = await supabase
            .from("habit_completions")
            .insert({ habit_id: habitId, date });
          if (err) throw err;
          setCompletions((prev) => [...prev, { habitId, date }]);
        }
      } else {
        const existing = completions.find(
          (c) => c.habitId === habitId && c.date === date
        );
        let updated: HabitCompletion[];
        if (existing) {
          updated = completions.filter(
            (c) => !(c.habitId === habitId && c.date === date)
          );
        } else {
          updated = [...completions, { habitId, date }];
        }
        setCompletions(updated);
        await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(updated));
      }
    },
    [completions]
  );

  const isCompleted = useCallback(
    (habitId: string, date: string) =>
      completions.some(
        (c) => c.habitId === habitId && c.date === date
      ),
    [completions]
  );

  const getStreak = useCallback(
    (habitId: string) => {
      let streak = 0;
      const today = new Date();
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = formatDate(d);
        const dayOfWeek = getDayOfWeek(dateStr);
        let shouldTrack = true;
        if (habit.frequency === "weekdays")
          shouldTrack = dayOfWeek >= 1 && dayOfWeek <= 5;
        else if (habit.frequency === "weekends")
          shouldTrack = dayOfWeek === 0 || dayOfWeek === 6;
        else if (habit.frequency === "custom" && habit.customDays)
          shouldTrack = habit.customDays.includes(dayOfWeek);
        if (!shouldTrack) continue;
        if (isCompleted(habitId, dateStr)) streak++;
        else {
          if (i === 0) continue;
          break;
        }
      }
      return streak;
    },
    [habits, isCompleted]
  );

  const getCompletionRate = useCallback(
    (habitId: string, days: number) => {
      const today = new Date();
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return 0;
      let tracked = 0;
      let completed = 0;
      for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = formatDate(d);
        const dayOfWeek = getDayOfWeek(dateStr);
        let shouldTrack = true;
        if (habit.frequency === "weekdays")
          shouldTrack = dayOfWeek >= 1 && dayOfWeek <= 5;
        else if (habit.frequency === "weekends")
          shouldTrack = dayOfWeek === 0 || dayOfWeek === 6;
        else if (habit.frequency === "custom" && habit.customDays)
          shouldTrack = habit.customDays.includes(dayOfWeek);
        if (!shouldTrack) continue;
        tracked++;
        if (isCompleted(habitId, dateStr)) completed++;
      }
      return tracked > 0 ? Math.round((completed / tracked) * 100) : 0;
    },
    [habits, isCompleted]
  );

  const getHabitsForDate = useCallback(
    (date: string) => {
      const dayOfWeek = getDayOfWeek(date);
      return habits.filter((h) => {
        if (h.frequency === "daily") return true;
        if (h.frequency === "weekdays")
          return dayOfWeek >= 1 && dayOfWeek <= 5;
        if (h.frequency === "weekends")
          return dayOfWeek === 0 || dayOfWeek === 6;
        if (h.frequency === "custom" && h.customDays)
          return h.customDays.includes(dayOfWeek);
        return true;
      });
    },
    [habits]
  );

  const getCompletedCount = useCallback(
    (date: string) => {
      const habitsForDate = getHabitsForDate(date);
      return habitsForDate.filter((h) => isCompleted(h.id, date)).length;
    },
    [getHabitsForDate, isCompleted]
  );

  const value = useMemo(
    () => ({
      habits,
      completions,
      isLoading,
      error,
      refetch: loadData,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompletion,
      isCompleted,
      getStreak,
      getCompletionRate,
      getHabitsForDate,
      getCompletedCount,
    }),
    [
      habits,
      completions,
      isLoading,
      error,
      loadData,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompletion,
      isCompleted,
      getStreak,
      getCompletionRate,
      getHabitsForDate,
      getCompletedCount,
    ]
  );

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
}
