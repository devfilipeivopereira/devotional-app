import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";
import Colors from "@/constants/colors";

export default function JournalScreen() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = React.useState<"all" | "highlights" | "notes">("all");

    const tabs = [
        { key: "all" as const, label: "Tudo" },
        { key: "highlights" as const, label: "Destaques" },
        { key: "notes" as const, label: "Anotações" },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Diário</Text>

            <View style={styles.tabsRow}>
                {tabs.map((tab) => (
                    <Pressable
                        key={tab.key}
                        onPress={() => setActiveTab(tab.key)}
                        style={[
                            styles.tabPill,
                            activeTab === tab.key
                                ? { borderColor: theme.text }
                                : { borderColor: "transparent" },
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: activeTab === tab.key ? theme.text : theme.textSecondary },
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📖</Text>
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>
                        Seu diário devocional
                    </Text>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Uma coleção dos seus destaques diários, versículos favoritos e anotações pessoais
                    </Text>
                </View>
            </ScrollView>

            <Pressable style={[styles.fab, { backgroundColor: Colors.palette.coral }]}>
                <Ionicons name="pencil" size={24} color="#fff" />
            </Pressable>
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
        gap: 8,
    },
    tabPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
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
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 100,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
});
