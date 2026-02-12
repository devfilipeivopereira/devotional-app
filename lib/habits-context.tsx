import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
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
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
  isCompleted: (habitId: string, date: string) => boolean;
  getStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days: number) => number;
  getHabitsForDate: (date: string) => Habit[];
  getCompletedCount: (date: string) => number;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

const HABITS_KEY = '@habitflow_habits';
const COMPLETIONS_KEY = '@habitflow_completions';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00').getDay();
}

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsData, completionsData] = await Promise.all([
        AsyncStorage.getItem(HABITS_KEY),
        AsyncStorage.getItem(COMPLETIONS_KEY),
      ]);
      if (habitsData) setHabits(JSON.parse(habitsData));
      if (completionsData) setCompletions(JSON.parse(completionsData));
    } catch (e) {
      console.error('Failed to load habits data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHabits = async (newHabits: Habit[]) => {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(newHabits));
  };

  const saveCompletions = async (newCompletions: HabitCompletion[]) => {
    await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(newCompletions));
  };

  const addHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    await saveHabits(updated);
  }, [habits]);

  const updateHabit = useCallback(async (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    const updated = habits.map(h => h.id === id ? { ...h, ...updates } : h);
    setHabits(updated);
    await saveHabits(updated);
  }, [habits]);

  const deleteHabit = useCallback(async (id: string) => {
    const updatedHabits = habits.filter(h => h.id !== id);
    const updatedCompletions = completions.filter(c => c.habitId !== id);
    setHabits(updatedHabits);
    setCompletions(updatedCompletions);
    await Promise.all([saveHabits(updatedHabits), saveCompletions(updatedCompletions)]);
  }, [habits, completions]);

  const toggleCompletion = useCallback(async (habitId: string, date: string) => {
    const existing = completions.find(c => c.habitId === habitId && c.date === date);
    let updated: HabitCompletion[];
    if (existing) {
      updated = completions.filter(c => !(c.habitId === habitId && c.date === date));
    } else {
      updated = [...completions, { habitId, date }];
    }
    setCompletions(updated);
    await saveCompletions(updated);
  }, [completions]);

  const isCompleted = useCallback((habitId: string, date: string) => {
    return completions.some(c => c.habitId === habitId && c.date === date);
  }, [completions]);

  const getStreak = useCallback((habitId: string) => {
    let streak = 0;
    const today = new Date();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const dayOfWeek = getDayOfWeek(dateStr);

      let shouldTrack = true;
      if (habit.frequency === 'weekdays') shouldTrack = dayOfWeek >= 1 && dayOfWeek <= 5;
      else if (habit.frequency === 'weekends') shouldTrack = dayOfWeek === 0 || dayOfWeek === 6;
      else if (habit.frequency === 'custom' && habit.customDays) shouldTrack = habit.customDays.includes(dayOfWeek);

      if (!shouldTrack) continue;

      if (isCompleted(habitId, dateStr)) {
        streak++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    return streak;
  }, [habits, completions, isCompleted]);

  const getCompletionRate = useCallback((habitId: string, days: number) => {
    const today = new Date();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;
    let tracked = 0;
    let completed = 0;

    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const dayOfWeek = getDayOfWeek(dateStr);

      let shouldTrack = true;
      if (habit.frequency === 'weekdays') shouldTrack = dayOfWeek >= 1 && dayOfWeek <= 5;
      else if (habit.frequency === 'weekends') shouldTrack = dayOfWeek === 0 || dayOfWeek === 6;
      else if (habit.frequency === 'custom' && habit.customDays) shouldTrack = habit.customDays.includes(dayOfWeek);

      if (!shouldTrack) continue;
      tracked++;
      if (isCompleted(habitId, dateStr)) completed++;
    }
    return tracked > 0 ? Math.round((completed / tracked) * 100) : 0;
  }, [habits, completions, isCompleted]);

  const getHabitsForDate = useCallback((date: string) => {
    const dayOfWeek = getDayOfWeek(date);
    return habits.filter(h => {
      if (h.frequency === 'daily') return true;
      if (h.frequency === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
      if (h.frequency === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
      if (h.frequency === 'custom' && h.customDays) return h.customDays.includes(dayOfWeek);
      return true;
    });
  }, [habits]);

  const getCompletedCount = useCallback((date: string) => {
    const habitsForDate = getHabitsForDate(date);
    return habitsForDate.filter(h => isCompleted(h.id, date)).length;
  }, [getHabitsForDate, isCompleted]);

  const value = useMemo(() => ({
    habits,
    completions,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
    getStreak,
    getCompletionRate,
    getHabitsForDate,
    getCompletedCount,
  }), [habits, completions, isLoading, addHabit, updateHabit, deleteHabit, toggleCompletion, isCompleted, getStreak, getCompletionRate, getHabitsForDate, getCompletedCount]);

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
}
