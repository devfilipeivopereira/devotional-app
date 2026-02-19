import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/lib/useTheme";
import Colors from "@/constants/colors";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { router } from "expo-router";

type ExploreSeries = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  tags: string[] | null;
  devotional_days: { id: string; day_number: number; title: string }[] | null;
};

export default function ExploreScreen() {
  const { theme } = useTheme();
  const [series, setSeries] = React.useState<ExploreSeries[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTag, setSelectedTag] = React.useState<string>("ALL");

  const loadExplore = React.useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("devotional_series")
      .select(
        "id,title,description,image_url,tags,devotional_days(id,day_number,title,is_published)"
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading explore content:", error.message);
      setSeries([]);
      setLoading(false);
      return;
    }

    const normalized = ((data ?? []) as any[]).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? null,
      image_url: item.image_url ?? null,
      tags: Array.isArray(item.tags) ? item.tags : [],
      devotional_days: (item.devotional_days ?? []).filter(
        (day: any) => day?.is_published === true
      ),
    })) as ExploreSeries[];

    setSeries(normalized);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadExplore();
  }, [loadExplore]);

  const availableTags = React.useMemo(() => {
    const set = new Set<string>();
    series.forEach((item) => {
      (item.tags ?? []).forEach((tag) => set.add(tag.toUpperCase()));
    });
    return ["ALL", ...Array.from(set)];
  }, [series]);

  const filteredSeries = React.useMemo(() => {
    const base = series.filter((item) => (item.devotional_days?.length ?? 0) > 0);
    if (selectedTag === "ALL") return base;
    return base.filter((item) =>
      (item.tags ?? []).some((tag) => tag.toUpperCase() === selectedTag)
    );
  }, [selectedTag, series]);

  const openSeries = (item: ExploreSeries) => {
    const firstDay = item.devotional_days?.[0];
    if (!firstDay) return;
    router.push({ pathname: "/session", params: { dayId: firstDay.id } } as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Explorar</Text>
          <Text style={[styles.favoritesLink, { color: Colors.palette.coral }]}>
            Categorias CMS
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {availableTags.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => setSelectedTag(tag)}
              style={[
                styles.categoryPill,
                selectedTag === tag
                  ? { backgroundColor: theme.text }
                  : { backgroundColor: theme.card },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedTag === tag ? theme.background : theme.text },
                ]}
              >
                {tag}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={Colors.palette.coral} />
          </View>
        ) : filteredSeries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Nenhum conteúdo encontrado para esta categoria.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredSeries.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => openSeries(item)}
              >
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                {!!item.description && (
                  <Text style={[styles.cardDescription, { color: theme.textSecondary }]} numberOfLines={3}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.cardFooter}>
                  <Text style={[styles.cardMeta, { color: Colors.palette.coral }]}>
                    {(item.devotional_days?.length ?? 0)} dia(s)
                  </Text>
                  <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>Abrir</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  favoritesLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoriesRow: {
    marginBottom: 20,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  grid: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardMeta: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
});
