import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/lib/useTheme';
import { useHabits } from '@/lib/habits-context';
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_400Regular } from '@expo-google-fonts/nunito';

type ViewMode = 'weekly' | 'monthly' | 'yearly';

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00').getDay();
}

function ChartBar({ label, value, maxValue, color, small, highlighted }: {
  label: string; value: number; maxValue: number; color: string; small?: boolean; highlighted?: boolean;
}) {
  const height = maxValue > 0 ? Math.max((value / maxValue) * 100, 4) : 4;
  return (
    <View style={[cbStyles.col, small && { minWidth: 18 }]}>
      <Text style={[cbStyles.value, { color }, small && { fontSize: 9 }]}>{value > 0 ? value : ''}</Text>
      <View style={[cbStyles.barBg, small && { width: 16, height: 80 }]}>
        <View style={[cbStyles.barFill, {
          height: `${height}%`,
          backgroundColor: value > 0 ? color : 'transparent',
          opacity: highlighted ? 1 : 0.6,
        }]} />
      </View>
      <Text style={[cbStyles.label, { color: '#9CA3AF' }, small && { fontSize: 9 }]}>{label}</Text>
    </View>
  );
}

const cbStyles = StyleSheet.create({
  col: { alignItems: 'center', flex: 1 },
  value: { fontSize: 11, fontWeight: '600' as const, marginBottom: 4 },
  barBg: {
    width: 24, height: 100, borderRadius: 12,
    backgroundColor: 'rgba(150,150,150,0.12)',
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  barFill: { borderRadius: 12, minHeight: 4 },
  label: { fontSize: 11, marginTop: 4, fontWeight: '500' as const },
});

export default function HabitDetailScreen() {
  const { theme, isDark, palette } = useTheme();
  const { habits, completions, isCompleted, toggleCompletion, getStreak, getCompletionRate } = useHabits();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; from?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const habit = useMemo(() => habits.find(h => h.id === params.id), [habits, params.id]);

  const streak = useMemo(() => habit ? getStreak(habit.id) : 0, [habit, getStreak, completions]);
  const rate7 = useMemo(() => habit ? getCompletionRate(habit.id, 7) : 0, [habit, getCompletionRate, completions]);
  const rate30 = useMemo(() => habit ? getCompletionRate(habit.id, 30) : 0, [habit, getCompletionRate, completions]);
  const rate365 = useMemo(() => habit ? getCompletionRate(habit.id, 365) : 0, [habit, getCompletionRate, completions]);

  const currentRate = viewMode === 'weekly' ? rate7 : viewMode === 'monthly' ? rate30 : rate365;

  const totalCompletions = useMemo(() => {
    if (!habit) return 0;
    return completions.filter(c => c.habitId === habit.id).length;
  }, [habit, completions]);

  const weeklyData = useMemo(() => {
    if (!habit) return [];
    const today = new Date();
    const result: { label: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const done = isCompleted(habit.id, dateStr) ? 1 : 0;
      result.push({ label: DAYS_PT[d.getDay()], value: done });
    }
    return result;
  }, [habit, isCompleted, completions]);

  const monthlyCalendar = useMemo(() => {
    if (!habit) return { days: [] as (null | { day: number; done: boolean; dateStr: string })[], year: 0, month: 0 };
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days: (null | { day: number; done: boolean; dateStr: string })[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, done: isCompleted(habit.id, dateStr), dateStr });
    }
    return { days, year, month };
  }, [habit, isCompleted, completions]);

  const monthlyWeeklyBreakdown = useMemo(() => {
    if (!habit) return [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: { label: string; done: number; total: number }[] = [];
    let weekDone = 0;
    let weekTotal = 0;
    let weekNum = 1;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = getDayOfWeek(dateStr);
      let shouldTrack = true;
      if (habit.frequency === 'weekdays') shouldTrack = dayOfWeek >= 1 && dayOfWeek <= 5;
      else if (habit.frequency === 'weekends') shouldTrack = dayOfWeek === 0 || dayOfWeek === 6;
      else if (habit.frequency === 'custom' && habit.customDays) shouldTrack = habit.customDays.includes(dayOfWeek);

      if (shouldTrack) {
        weekTotal++;
        if (isCompleted(habit.id, dateStr)) weekDone++;
      }
      const dow = new Date(year, month, d).getDay();
      if (dow === 6 || d === daysInMonth) {
        weeks.push({ label: `S${weekNum}`, done: weekDone, total: weekTotal });
        weekDone = 0;
        weekTotal = 0;
        weekNum++;
      }
    }
    return weeks;
  }, [habit, isCompleted, completions]);

  const yearlyMonthData = useMemo(() => {
    if (!habit) return [];
    const year = new Date().getFullYear();
    const result: { label: string; done: number; total: number; rate: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      let done = 0;
      let total = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayOfWeek = getDayOfWeek(dateStr);
        let shouldTrack = true;
        if (habit.frequency === 'weekdays') shouldTrack = dayOfWeek >= 1 && dayOfWeek <= 5;
        else if (habit.frequency === 'weekends') shouldTrack = dayOfWeek === 0 || dayOfWeek === 6;
        else if (habit.frequency === 'custom' && habit.customDays) shouldTrack = habit.customDays.includes(dayOfWeek);
        if (shouldTrack) {
          total++;
          if (isCompleted(habit.id, dateStr)) done++;
        }
      }
      const rate = total > 0 ? Math.round((done / total) * 100) : 0;
      result.push({ label: MONTHS_SHORT[m], done, total, rate });
    }
    return result;
  }, [habit, isCompleted, completions]);

  const yearlyHeatmap = useMemo(() => {
    if (!habit) return [];
    const year = new Date().getFullYear();
    const months: { month: string; weeks: number[][] }[] = [];
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      const firstDay = new Date(year, m, 1).getDay();
      const weeks: number[][] = [];
      let week: number[] = [];
      for (let pad = 0; pad < firstDay; pad++) week.push(-1);
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        week.push(isCompleted(habit.id, dateStr) ? 1 : 0);
        if (week.length === 7) { weeks.push(week); week = []; }
      }
      if (week.length > 0) { while (week.length < 7) week.push(-1); weeks.push(week); }
      months.push({ month: MONTHS_SHORT[m], weeks });
    }
    return months;
  }, [habit, isCompleted, completions]);

  const handleToggleToday = useCallback(async () => {
    if (!habit) return;
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleCompletion(habit.id, formatDate(new Date()));
  }, [habit, toggleCompletion]);

  const todayDone = useMemo(() => habit ? isCompleted(habit.id, formatDate(new Date())) : false, [habit, isCompleted, completions]);
  const periodLabel = viewMode === 'weekly' ? '7d' : viewMode === 'monthly' ? '30d' : '365d';
  const freqLabels: Record<string, string> = { daily: 'Diario', weekdays: 'Dias uteis', weekends: 'Fins de semana', custom: 'Personalizado' };

  if (!fontsLoaded || !habit) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS !== 'web' ? insets.top : webTopInset) + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.topTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]} numberOfLines={1}>
          {habit.name}
        </Text>
        <Pressable onPress={() => router.push({ pathname: '/habit-form', params: { id: habit.id, from: params.from } })} hitSlop={12}>
          <Ionicons name="create-outline" size={24} color={theme.textSecondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.duration(400) : undefined} style={[styles.heroCard, { backgroundColor: habit.color }]}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Ionicons name={habit.icon as any} size={32} color="#fff" />
            </View>
            <Pressable onPress={handleToggleToday} style={[styles.todayBtn, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Ionicons name={todayDone ? 'checkmark-circle' : 'ellipse-outline'} size={22} color="#fff" />
              <Text style={styles.todayBtnText}>{todayDone ? 'Feito hoje' : 'Marcar hoje'}</Text>
            </Pressable>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{streak}</Text>
              <Text style={styles.heroStatLabel}>Sequencia</Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{currentRate}%</Text>
              <Text style={styles.heroStatLabel}>Taxa ({periodLabel})</Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{totalCompletions}</Text>
              <Text style={styles.heroStatLabel}>Total</Text>
            </View>
          </View>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="repeat-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroMetaText}>{freqLabels[habit.frequency]}</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroMetaText}>
                Desde {new Date(habit.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={[styles.segmentContainer, { marginHorizontal: 16, marginBottom: 16 }]}>
          <View style={[styles.segmentBar, { backgroundColor: theme.card }]}>
            {(['weekly', 'monthly', 'yearly'] as ViewMode[]).map(mode => {
              const labels = { weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual' };
              const active = viewMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setViewMode(mode)}
                  style={[styles.segmentBtn, active && { backgroundColor: habit.color }]}
                >
                  <Text style={[
                    styles.segmentText,
                    { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' },
                    active && { color: '#fff' },
                  ]}>
                    {labels[mode]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {viewMode === 'weekly' && (
          <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(100).duration(400) : undefined} style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
              Ultimos 7 dias
            </Text>
            <View style={styles.weekDotsRow}>
              {weeklyData.map((d, i) => (
                <View key={i} style={styles.weekDotCol}>
                  <View style={[
                    styles.weekDot,
                    d.value > 0
                      ? { backgroundColor: habit.color }
                      : { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
                  ]}>
                    {d.value > 0 && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                  <Text style={[styles.weekDotLabel, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
                    {d.label}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {viewMode === 'monthly' && (
          <>
            <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(100).duration(400) : undefined} style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                {MONTHS_SHORT[monthlyCalendar.month]} {monthlyCalendar.year}
              </Text>
              <View style={styles.calWeekHeader}>
                {DAYS_PT.map(d => (
                  <View key={d} style={styles.calHeaderCell}>
                    <Text style={[styles.calHeaderText, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>{d}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.calGrid}>
                {monthlyCalendar.days.map((item, i) => (
                  <View key={i} style={styles.calCell}>
                    {item ? (
                      <View style={[
                        styles.calDay,
                        item.done && { backgroundColor: habit.color },
                        !item.done && { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                      ]}>
                        <Text style={[
                          styles.calDayText,
                          { fontFamily: 'Nunito_600SemiBold' },
                          item.done ? { color: '#fff' } : { color: theme.textSecondary },
                        ]}>
                          {item.day}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(400) : undefined} style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                Resumo semanal
              </Text>
              {monthlyWeeklyBreakdown.map((w, i) => {
                const rate = w.total > 0 ? Math.round((w.done / w.total) * 100) : 0;
                return (
                  <View key={i} style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>{w.label}</Text>
                    <View style={styles.breakdownBarWrap}>
                      <View style={[styles.breakdownBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                        <View style={[styles.breakdownBarFill, { width: `${rate}%`, backgroundColor: habit.color }]} />
                      </View>
                    </View>
                    <Text style={[styles.breakdownValue, { color: theme.text, fontFamily: 'Nunito_600SemiBold' }]}>
                      {w.done}/{w.total}
                    </Text>
                    <Text style={[styles.breakdownRate, { color: habit.color, fontFamily: 'Nunito_700Bold' }]}>{rate}%</Text>
                  </View>
                );
              })}
            </Animated.View>
          </>
        )}

        {viewMode === 'yearly' && (
          <>
            <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(100).duration(400) : undefined} style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                {new Date().getFullYear()} - Taxa mensal
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={[styles.barsRow, { gap: 2, paddingRight: 8 }]}>
                  {yearlyMonthData.map((d, i) => (
                    <ChartBar key={i} label={d.label} value={d.rate} maxValue={100} color={habit.color} small />
                  ))}
                </View>
              </ScrollView>
            </Animated.View>

            <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(400) : undefined} style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                Mapa de atividade
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {yearlyHeatmap.map((monthData, mi) => (
                    <View key={mi} style={{ alignItems: 'center' }}>
                      <View style={{ gap: 1 }}>
                        {monthData.weeks.map((week, wi) => (
                          <View key={wi} style={{ flexDirection: 'row', gap: 1 }}>
                            {week.map((val, di) => (
                              <View key={di}>
                                {val === -1 ? (
                                  <View style={{ width: 10, height: 10, margin: 1 }} />
                                ) : (
                                  <View style={{
                                    width: 10, height: 10, borderRadius: 2, margin: 1,
                                    backgroundColor: val > 0 ? habit.color : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                    opacity: val > 0 ? 1 : 1,
                                  }} />
                                )}
                              </View>
                            ))}
                          </View>
                        ))}
                      </View>
                      <Text style={[styles.heatmapLabel, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
                        {monthData.month}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
              <View style={styles.legendRow}>
                <Text style={[styles.legendText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>Nao feito</Text>
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: habit.color }} />
                <Text style={[styles.legendText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>Feito</Text>
              </View>
            </Animated.View>

            <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(300).duration(400) : undefined} style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                Resumo mensal
              </Text>
              {yearlyMonthData.map((m, i) => (
                <View key={i} style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold', width: 36 }]}>{m.label}</Text>
                  <View style={styles.breakdownBarWrap}>
                    <View style={[styles.breakdownBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                      <View style={[styles.breakdownBarFill, { width: `${m.rate}%`, backgroundColor: habit.color }]} />
                    </View>
                  </View>
                  <Text style={[styles.breakdownValue, { color: theme.text, fontFamily: 'Nunito_600SemiBold' }]}>
                    {m.done}/{m.total}
                  </Text>
                  <Text style={[styles.breakdownRate, { color: habit.color, fontFamily: 'Nunito_700Bold' }]}>{m.rate}%</Text>
                </View>
              ))}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  topTitle: { fontSize: 18, flex: 1, textAlign: 'center' },
  heroCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  todayBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' as const },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  heroStatItem: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 26, fontWeight: '800' as const, color: '#fff' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  heroDivider: { width: 1, height: 36 },
  heroMeta: { flexDirection: 'row', gap: 16 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  segmentContainer: {},
  segmentBar: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  segmentText: { fontSize: 13 },
  card: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, marginBottom: 16 },
  weekDotsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDotCol: { alignItems: 'center', gap: 6 },
  weekDot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  weekDotLabel: { fontSize: 11 },
  calWeekHeader: { flexDirection: 'row', marginBottom: 6 },
  calHeaderCell: { flex: 1, alignItems: 'center' },
  calHeaderText: { fontSize: 11, textTransform: 'uppercase' as const },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', alignItems: 'center', marginBottom: 6 },
  calDay: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  calDayText: { fontSize: 12 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  breakdownLabel: { fontSize: 12, width: 24 },
  breakdownBarWrap: { flex: 1 },
  breakdownBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  breakdownBarFill: { height: '100%', borderRadius: 4 },
  breakdownValue: { fontSize: 12, width: 36, textAlign: 'right' },
  breakdownRate: { fontSize: 12, width: 34, textAlign: 'right' },
  barsRow: { flexDirection: 'row', gap: 4 },
  heatmapLabel: { fontSize: 9, marginTop: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' },
  legendText: { fontSize: 10 },
});
