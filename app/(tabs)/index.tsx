import React, { useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/lib/useTheme';
import { useHabits } from '@/lib/habits-context';
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_400Regular } from '@expo-google-fonts/nunito';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function HabitCard({
  habit,
  done,
  streak,
  onToggle,
  onLongPress,
  index,
}: {
  habit: any;
  done: boolean;
  streak: number;
  onToggle: () => void;
  onLongPress: () => void;
  index: number;
}) {
  const { theme, palette } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
    onToggle();
  };

  return (
    <Animated.View
      entering={Platform.OS !== 'web' ? FadeInRight.delay(index * 80).duration(400) : undefined}
      style={animatedStyle}
    >
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        style={[
          styles.habitCard,
          { backgroundColor: theme.card },
          done && { borderLeftWidth: 4, borderLeftColor: habit.color },
        ]}
      >
        <View style={[styles.habitIconContainer, { backgroundColor: habit.color + '18' }]}>
          <Ionicons name={habit.icon as any} size={22} color={habit.color} />
        </View>
        <View style={styles.habitInfo}>
          <Text
            style={[
              styles.habitName,
              { color: theme.text, fontFamily: 'Nunito_600SemiBold' },
              done && { textDecorationLine: 'line-through' as const, opacity: 0.5 },
            ]}
          >
            {habit.name}
          </Text>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={12} color={palette.coral} />
              <Text style={[styles.streakText, { color: palette.coral, fontFamily: 'Nunito_600SemiBold' }]}>
                {streak} dias
              </Text>
            </View>
          )}
        </View>
        <View style={[
          styles.checkCircle,
          done
            ? { backgroundColor: habit.color }
            : { borderWidth: 2, borderColor: theme.textSecondary + '40' },
        ]}>
          {done && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function TodayScreen() {
  const { theme, isDark, palette } = useTheme();
  const {
    habits, getHabitsForDate, isCompleted, toggleCompletion, getStreak,
    getCompletedCount, deleteHabit, error, refetch,
  } = useHabits();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const today = useMemo(() => formatDate(new Date()), []);
  const todayHabits = useMemo(() => getHabitsForDate(today), [today, getHabitsForDate]);
  const completedCount = useMemo(() => getCompletedCount(today), [today, getCompletedCount]);
  const progress = todayHabits.length > 0 ? completedCount / todayHabits.length : 0;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const handleToggle = useCallback(async (habitId: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await toggleCompletion(habitId, today);
  }, [today, toggleCompletion]);

  const handleLongPress = useCallback((habit: any) => {
    if (Platform.OS === 'web') {
      if (confirm(`Deseja gerenciar "${habit.name}"?\n\nEditar ou Excluir?`)) {
        router.push({ pathname: '/habit-form', params: { id: habit.id } });
      }
      return;
    }
    Alert.alert(habit.name, 'O que deseja fazer?', [
      { text: 'Editar', onPress: () => router.push({ pathname: '/habit-form', params: { id: habit.id } }) },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteHabit(habit.id) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }, [deleteHabit]);

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={{ paddingTop: (Platform.OS !== 'web' ? insets.top : webTopInset) + 16 }}>
          {error && (
            <Pressable
              onPress={() => refetch()}
              style={[styles.errorBanner, { backgroundColor: palette.coral + '20', borderColor: palette.coral }]}
            >
              <Ionicons name="warning-outline" size={20} color={palette.coral} />
              <Text style={[styles.errorText, { color: theme.text, fontFamily: 'Nunito_600SemiBold' }]}>
                {error}
              </Text>
              <Text style={[styles.errorRetry, { color: palette.coral, fontFamily: 'Nunito_600SemiBold' }]}>
                Tentar novamente
              </Text>
            </Pressable>
          )}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>
                {greeting}
              </Text>
              <Text style={[styles.title, { color: theme.text, fontFamily: 'Nunito_800ExtraBold' }]}>
                Seus habitos
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/habit-form')}
              style={[styles.addBtn, { backgroundColor: palette.teal }]}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          </View>

          {todayHabits.length > 0 && (
            <Animated.View
              entering={Platform.OS !== 'web' ? FadeInDown.duration(400) : undefined}
              style={[styles.progressCard, { backgroundColor: isDark ? palette.navyLight : palette.teal }]}
            >
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>Progresso de hoje</Text>
                <Text style={styles.progressCount}>
                  {completedCount} de {todayHabits.length}
                </Text>
              </View>
              <View style={styles.progressRing}>
                <View style={styles.progressRingBg}>
                  <View style={[styles.progressRingFill, {
                    backgroundColor: progress === 1 ? '#34D399' : 'rgba(255,255,255,0.9)',
                  }]}>
                    <Text style={[styles.progressPercent, { color: progress === 1 ? '#fff' : palette.teal }]}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          <View style={styles.habitsList}>
            {todayHabits.length === 0 ? (
              <Animated.View
                entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(400) : undefined}
                style={[styles.emptyState, { backgroundColor: theme.card }]}
              >
                <Ionicons name="leaf-outline" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
                  Comece sua jornada
                </Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: 'Nunito_400Regular' }]}>
                  Toque no + para adicionar seu primeiro habito
                </Text>
              </Animated.View>
            ) : (
              todayHabits.map((habit, i) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  done={isCompleted(habit.id, today)}
                  streak={getStreak(habit.id)}
                  onToggle={() => handleToggle(habit.id)}
                  onLongPress={() => handleLongPress(habit)}
                  index={i}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: { fontSize: 14, marginBottom: 2 },
  title: { fontSize: 28 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  progressInfo: { flex: 1 },
  progressTitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' as const },
  progressCount: { fontSize: 22, color: '#fff', fontWeight: '700' as const, marginTop: 4 },
  progressRing: { marginLeft: 16 },
  progressRingBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingFill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: { fontSize: 14, fontWeight: '700' as const },
  habitsList: { paddingHorizontal: 16 },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 14,
  },
  habitIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  streakText: { fontSize: 11 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  emptyTitle: { fontSize: 20, marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: { flex: 1, fontSize: 13 },
  errorRetry: { fontSize: 13 },
});
