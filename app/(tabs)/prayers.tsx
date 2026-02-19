import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useTheme } from "@/lib/useTheme";

export default function PrayersScreen() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = React.useState<"shared" | "private">("shared");

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Orações</Text>

            <View style={styles.tabsRow}>
                <Text
                    onPress={() => setActiveTab("shared")}
                    style={[
                        styles.tabText,
                        activeTab === "shared"
                            ? { color: theme.tint, fontWeight: "700" }
                            : { color: theme.textSecondary },
                    ]}
                >
                    Compartilhado
                </Text>
                <Text
                    onPress={() => setActiveTab("private")}
                    style={[
                        styles.tabText,
                        activeTab === "private"
                            ? { color: theme.tint, fontWeight: "700" }
                            : { color: theme.textSecondary },
                    ]}
                >
                    Particular
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🙏</Text>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        {activeTab === "shared"
                            ? "Orações compartilhadas aparecerão aqui"
                            : "Suas orações particulares aparecerão aqui"}
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
    title: {
        fontSize: 28,
        fontWeight: "700",
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    tabsRow: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 20,
    },
    tabText: {
        fontSize: 15,
        fontWeight: "500",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
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
