import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/useTheme';
import { useHabits } from '@/lib/habits-context';
import Colors from '@/constants/colors';
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_400Regular } from '@expo-google-fonts/nunito';

const ICON_OPTIONS = [
  'water-outline', 'book-outline', 'fitness-outline', 'musical-notes-outline',
  'code-slash-outline', 'leaf-outline', 'heart-outline', 'moon-outline',
  'sunny-outline', 'walk-outline', 'bicycle-outline', 'cafe-outline',
  'pencil-outline', 'language-outline', 'medkit-outline', 'nutrition-outline',
  'bed-outline', 'timer-outline', 'barbell-outline', 'happy-outline',
];

const FREQUENCY_OPTIONS = [
  { key: 'daily', label: 'Diario' },
  { key: 'weekdays', label: 'Dias uteis' },
  { key: 'weekends', label: 'Fins de semana' },
  { key: 'custom', label: 'Personalizado' },
] as const;

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export default function HabitFormScreen() {
  const { theme, isDark, palette, habitColors } = useTheme();
  const { habits, addHabit, updateHabit, deleteHabit } = useHabits();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });

  const editingHabit = useMemo(() => {
    if (params.id) return habits.find(h => h.id === params.id);
    return null;
  }, [params.id, habits]);

  const [name, setName] = useState(editingHabit?.name ?? '');
  const [color, setColor] = useState(editingHabit?.color ?? habitColors[0]);
  const [icon, setIcon] = useState(editingHabit?.icon ?? ICON_OPTIONS[0]);
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends' | 'custom'>(editingHabit?.frequency ?? 'daily');
  const [customDays, setCustomDays] = useState<number[]>(editingHabit?.customDays ?? [1, 2, 3, 4, 5]);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setColor(editingHabit.color);
      setIcon(editingHabit.icon);
      setFrequency(editingHabit.frequency);
      if (editingHabit.customDays) setCustomDays(editingHabit.customDays);
    }
  }, [editingHabit]);

  const handleSave = async () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        alert('Digite o nome do habito');
      } else {
        Alert.alert('Erro', 'Digite o nome do habito');
      }
      return;
    }

    if (frequency === 'custom' && customDays.length === 0) {
      if (Platform.OS === 'web') {
        alert('Selecione pelo menos um dia em Personalizado');
      } else {
        Alert.alert('Erro', 'Selecione pelo menos um dia em Personalizado');
      }
      return;
    }

    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      const payload = {
        name: name.trim(),
        color,
        icon,
        frequency,
        customDays: frequency === 'custom' ? customDays : undefined,
      };
      if (editingHabit) {
        await updateHabit(editingHabit.id, payload);
      } else {
        await addHabit(payload);
      }
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Nao foi possivel salvar o habito';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Erro ao salvar', msg);
      }
    }
  };

  const handleDelete = () => {
    if (!editingHabit) return;
    if (Platform.OS === 'web') {
      if (confirm(`Excluir "${editingHabit.name}"?`)) {
        deleteHabit(editingHabit.id);
        router.back();
      }
      return;
    }
    Alert.alert('Excluir habito', `Deseja excluir "${editingHabit.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteHabit(editingHabit.id);
          router.back();
        },
      },
    ]);
  };

  const toggleCustomDay = (day: number) => {
    if (customDays.includes(day)) {
      if (customDays.length > 1) {
        setCustomDays(customDays.filter(d => d !== day));
      }
    } else {
      setCustomDays([...customDays, day]);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS !== 'web' ? insets.top : webTopInset) + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.topTitle, { color: theme.text, fontFamily: 'Nunito_700Bold' }]}>
          {editingHabit ? 'Editar habito' : 'Novo habito'}
        </Text>
        <Pressable onPress={handleSave} hitSlop={12}>
          <Ionicons name="checkmark" size={28} color={palette.teal} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <View style={styles.previewSection}>
          <View style={[styles.previewCard, { backgroundColor: theme.card }]}>
            <View style={[styles.previewIcon, { backgroundColor: color + '18' }]}>
              <Ionicons name={icon as any} size={28} color={color} />
            </View>
            <Text style={[styles.previewName, { color: name ? theme.text : theme.textSecondary, fontFamily: 'Nunito_700Bold' }]}>
              {name || 'Nome do habito'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>NOME</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.card,
              color: theme.text,
              fontFamily: 'Nunito_400Regular',
              borderColor: theme.border,
            }]}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Beber agua"
            placeholderTextColor={theme.textSecondary}
            maxLength={40}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>COR</Text>
          <View style={styles.colorGrid}>
            {habitColors.map((c: string) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorOption,
                  { backgroundColor: c },
                  color === c && styles.colorSelected,
                ]}
              >
                {color === c && <Ionicons name="checkmark" size={16} color="#fff" />}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>ICONE</Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map(ic => (
              <Pressable
                key={ic}
                onPress={() => setIcon(ic)}
                style={[
                  styles.iconOption,
                  { backgroundColor: theme.card },
                  icon === ic && { backgroundColor: color + '20', borderColor: color, borderWidth: 2 },
                ]}
              >
                <Ionicons name={ic as any} size={22} color={icon === ic ? color : theme.textSecondary} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: 'Nunito_600SemiBold' }]}>FREQUENCIA</Text>
          <View style={styles.freqGrid}>
            {FREQUENCY_OPTIONS.map(f => (
              <Pressable
                key={f.key}
                onPress={() => setFrequency(f.key)}
                style={[
                  styles.freqOption,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  frequency === f.key && { backgroundColor: palette.teal, borderColor: palette.teal },
                ]}
              >
                <Text style={[
                  styles.freqText,
                  { color: theme.text, fontFamily: 'Nunito_600SemiBold' },
                  frequency === f.key && { color: '#fff' },
                ]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {frequency === 'custom' && (
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((d, i) => (
                <Pressable
                  key={d}
                  onPress={() => toggleCustomDay(i)}
                  style={[
                    styles.weekdayBtn,
                    { backgroundColor: theme.card },
                    customDays.includes(i) && { backgroundColor: palette.teal },
                  ]}
                >
                  <Text style={[
                    styles.weekdayText,
                    { color: theme.text, fontFamily: 'Nunito_600SemiBold' },
                    customDays.includes(i) && { color: '#fff' },
                  ]}>
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {editingHabit && (
          <View style={styles.section}>
            <Pressable onPress={handleDelete} style={[styles.deleteBtn, { backgroundColor: palette.danger + '12' }]}>
              <Ionicons name="trash-outline" size={20} color={palette.danger} />
              <Text style={[styles.deleteText, { color: palette.danger, fontFamily: 'Nunito_600SemiBold' }]}>
                Excluir habito
              </Text>
            </Pressable>
          </View>
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
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  topTitle: { fontSize: 18 },
  previewSection: { paddingHorizontal: 20, marginBottom: 8, marginTop: 8 },
  previewCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: { fontSize: 20 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  label: { fontSize: 12, letterSpacing: 1, marginBottom: 10 },
  input: {
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  freqOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  freqText: { fontSize: 13 },
  weekdayRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  weekdayBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  weekdayText: { fontSize: 12 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
  },
  deleteText: { fontSize: 15 },
});
