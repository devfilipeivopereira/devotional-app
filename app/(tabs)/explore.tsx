import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useTheme } from "@/lib/useTheme";
import Colors from "@/constants/colors";

export default function ExploreScreen() {
    const { theme } = useTheme();

    const categories = ["MENTE", "MÚSICA", "ESTUDOS"];
    const filters = ["ALL", "DORMIR", "ANSIEDADE", "<5MINS"];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Explorar</Text>
                    <Text style={[styles.favoritesLink, { color: Colors.palette.coral }]}>
                        ❤️ Favoritos
                    </Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
                    {categories.map((cat, i) => (
                        <View
                            key={cat}
                            style={[
                                styles.categoryPill,
                                i === 0
                                    ? { backgroundColor: theme.text }
                                    : { backgroundColor: theme.card },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    { color: i === 0 ? theme.background : theme.text },
                                ]}
                            >
                                {cat}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
                    {filters.map((filter, i) => (
                        <View
                            key={filter}
                            style={[
                                styles.filterPill,
                                i === 0
                                    ? { borderColor: Colors.palette.coral }
                                    : { borderColor: theme.border },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    { color: i === 0 ? Colors.palette.coral : theme.textSecondary },
                                ]}
                            >
                                {filter}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.emptyState}>
                    <Text style={[styles.emptyIcon]}>🔍</Text>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Séries devocionais aparecerão aqui
                    </Text>
                </View>
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
        marginBottom: 12,
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
    filtersRow: {
        marginBottom: 32,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
    },
    filterText: {
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
