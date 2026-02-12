import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/useTheme';
import { useHabits } from '@/lib/habits-context';
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_400Regular } from '@expo-google-fonts/nunito';
import Animated, { FadeInDown } from 'react-native-reanimated';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function WeeklyBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const height = maxValue > 0 ? Math.max((value / maxValue) * 100, 4) : 4;
  return (
    <View style={barStyles.col}>
      <Text style={[barStyles.value, { color }]}>{value}</Text>
      <View style={barStyles.barBg}>
        <View style={[barStyles.barFill, { height: `${height}%`, backgroundColor: color }]} />
      </View>
      <Text style={[barStyles.label, { color: '#9CA3AF' }]}>{label}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  col: { alignItems: 'center', flex: 1 },
  value: { fontSize: 11, fontWeight: '600' as const, marginBottom: 4 },
  barBg: {
    width: 24,
    height: 100,
    borderRadius: 12,
    backgroundColor: 'rgba(150,150,150,0.12)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { borderRadius: 12, minHeight: 4 },
  label: { fontSize: 11, marginTop: 4, fontWeight: '500' as const },
});

export default function StatsScreen() {
  const { theme, isDark, palette } = useTheme();
  const { habits, getStreak, getCompletionRate, getHabitsForDate, getCompletedCount } = useHabits();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const weeklyData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const result: { label: string; value: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const completed = getCompletedCount(dateStr);
      result.push({ label: days[d.getDay()], value: completed });
    }
    return result;
  }, [getCompletedCount]);

  const maxWeekly = useMemo(() => Math.max(...weeklyData.map(d => d.value), 1), [weeklyData]);

  const overallStats = useMemo(() => {
    if (habits.length === 0) return { totalRate: 0, bestStreak: 0, activeHabits: 0, todayDone: 0, todayTotal: 0 };
    const today = formatDate(new Date());
    const todayHabits = getHabitsForDate(today);
    const todayDone = getCompletedCount(today);
    const rates = habits.map(h => getCompletionRate(h.id, 30));
    const totalRate = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
    const bestStreak = Math.max(...habits.map(h => getStreak(h.id)), 0);
    return { totalRate, bestStreak, activeHabits: habits.length, todayDone, todayTotal: todayHabits.length };
  }, [habits, getCompletionRate, getStreak, getHabitsForDate, getCompletedCount]);

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={{ paddingTop: (Platform.OS !== 'web' ? insets.top : webTopInset) + 16 }}>
          <Text style={[styles.screenTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
            Progresso
          </Text>

          {habits.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <Ionicons name="analytics-outline" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: 'Nunito_600SemiBold' }]}>
                Sem dados ainda
              </Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                Adicione habitos para ver suas estatisticas aqui
              </Text>
            </View>
          ) : (
            <>
              <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(100).duration(400) : undefined} style={[styles.summaryCard, { backgroundColor: palette.teal }]}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{overallStats.todayDone}/{overallStats.todayTotal}</Text>
                    <Text style={styles.summaryLabel}>Hoje</Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{overallStats.totalRate}%</Text>
                    <Text style={styles.summaryLabel}>Taxa (30d)</Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{overallStats.bestStreak}</Text>
                    <Text style={styles.summaryLabel}>Melhor seq.</Text>
                  </View>
                </View>
              </Animated.View>

              <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(400) : undefined} style={[styles.weekCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                  Esta semana
                </Text>
                <View style={styles.weekBars}>
                  {weeklyData.map((d, i) => (
                    <WeeklyBar
                      key={i}
                      label={d.label}
                      value={d.value}
                      maxValue={maxWeekly}
                      color={palette.teal}
                    />
                  ))}
                </View>
              </Animated.View>

              <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(300).duration(400) : undefined}>
                <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                  Por habito
                </Text>
                {habits.map(habit => {
                  const streak = getStreak(habit.id);
                  const rate = getCompletionRate(habit.id, 30);
                  return (
                    <View key={habit.id} style={[styles.habitStatCard, { backgroundColor: theme.card }]}>
                      <View style={styles.habitStatHeader}>
                        <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
                          <Ionicons name={habit.icon as any} size={20} color={habit.color} />
                        </View>
                        <Text style={[styles.habitStatName, { color: theme.text, fontFamily: 'Nunito_600SemiBold' }]}>
                          {habit.name}
                        </Text>
                      </View>
                      <View style={styles.habitStatRow}>
                        <View style={styles.habitStatItem}>
                          <Ionicons name="flame-outline" size={16} color={palette.coral} />
                          <Text style={[styles.habitStatValue, { color: theme.text }]}>{streak} dias</Text>
                        </View>
                        <View style={styles.habitStatItem}>
                          <Ionicons name="trending-up-outline" size={16} color={palette.teal} />
                          <Text style={[styles.habitStatValue, { color: theme.text }]}>{rate}%</Text>
                        </View>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${rate}%`, backgroundColor: habit.color }]} />
                      </View>
                    </View>
                  );
                })}
              </Animated.View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: { fontSize: 28, marginHorizontal: 20, marginBottom: 16 },
  emptyCard: {
    margin: 20,
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 18, marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  summaryCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '700' as const, color: '#fff' },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  summaryDivider: { width: 1, height: 40 },
  weekCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, marginBottom: 16 },
  weekBars: { flexDirection: 'row', gap: 4 },
  sectionTitle: { fontSize: 20, marginHorizontal: 20, marginBottom: 12, marginTop: 8 },
  habitStatCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  habitStatHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  habitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitStatName: { fontSize: 16, flex: 1 },
  habitStatRow: { flexDirection: 'row', gap: 24, marginBottom: 12 },
  habitStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  habitStatValue: { fontSize: 14, fontWeight: '500' as const },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(150,150,150,0.12)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
});
