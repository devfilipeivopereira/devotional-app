import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/useTheme';
import { useHabits } from '@/lib/habits-context';
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_400Regular } from '@expo-google-fonts/nunito';

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function CalendarScreen() {
  const { theme, isDark, palette } = useTheme();
  const { habits, getHabitsForDate, getCompletedCount, isCompleted } = useHabits();
  const insets = useSafeAreaInsets();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth, currentYear]);

  const selectedHabits = useMemo(() => {
    return getHabitsForDate(selectedDate);
  }, [selectedDate, getHabitsForDate]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDateCompletion = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const habitsForDay = getHabitsForDate(dateStr);
    if (habitsForDay.length === 0) return 0;
    const completed = getCompletedCount(dateStr);
    return completed / habitsForDay.length;
  };

  const todayStr = formatDate(new Date());

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
            Calendario
          </Text>

          <View style={[styles.calendarCard, { backgroundColor: theme.card }]}>
            <View style={styles.monthNav}>
              <Pressable onPress={prevMonth} hitSlop={12}>
                <Ionicons name="chevron-back" size={24} color={palette.teal} />
              </Pressable>
              <Text style={[styles.monthTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                {MONTHS_PT[currentMonth]} {currentYear}
              </Text>
              <Pressable onPress={nextMonth} hitSlop={12}>
                <Ionicons name="chevron-forward" size={24} color={palette.teal} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {DAYS_PT.map(d => (
                <View key={d} style={styles.dayHeaderCell}>
                  <Text style={[styles.dayHeader, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>{d}</Text>
                </View>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((day, i) => {
                if (day === null) return <View key={`e-${i}`} style={styles.dayCell} />;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const completion = getDateCompletion(day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <Pressable
                    key={`d-${day}`}
                    style={styles.dayCell}
                    onPress={() => setSelectedDate(dateStr)}
                  >
                    <View style={[
                      styles.dayCircle,
                      isSelected && { backgroundColor: palette.teal },
                      isToday && !isSelected && { borderWidth: 2, borderColor: palette.teal },
                    ]}>
                      <Text style={[
                        styles.dayText,
                        { color: theme.text, fontFamily: 'Nunito_600SemiBold' },
                        isSelected && { color: '#fff' },
                      ]}>
                        {day}
                      </Text>
                    </View>
                    {completion > 0 && (
                      <View style={styles.completionDots}>
                        <View style={[
                          styles.dot,
                          {
                            backgroundColor: completion === 1 ? palette.success : completion >= 0.5 ? palette.warning : palette.coral,
                          },
                        ]} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.selectedSection}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
              {selectedDate === todayStr ? 'Hoje' : selectedDate.split('-').reverse().join('/')}
            </Text>
            {selectedHabits.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
                <Ionicons name="leaf-outline" size={32} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                  Nenhum habito para este dia
                </Text>
              </View>
            ) : (
              selectedHabits.map(habit => {
                const done = isCompleted(habit.id, selectedDate);
                return (
                  <View key={habit.id} style={[styles.habitRow, { backgroundColor: theme.card }]}>
                    <View style={[styles.habitDot, { backgroundColor: habit.color }]} />
                    <Text style={[styles.habitName, { color: theme.text, fontFamily: 'Nunito_600SemiBold' }]}>
                      {habit.name}
                    </Text>
                    <Ionicons
                      name={done ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={done ? palette.success : theme.textSecondary}
                    />
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: { fontSize: 28, marginHorizontal: 20, marginBottom: 16 },
  calendarCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  monthTitle: { fontSize: 18 },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  dayHeaderCell: { flex: 1, alignItems: 'center' },
  dayHeader: { fontSize: 12, textTransform: 'uppercase' as const },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', alignItems: 'center', marginBottom: 8 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 14 },
  completionDots: { flexDirection: 'row', marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  selectedSection: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, marginBottom: 12 },
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { fontSize: 14 },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  habitDot: { width: 10, height: 10, borderRadius: 5 },
  habitName: { flex: 1, fontSize: 15 },
});
