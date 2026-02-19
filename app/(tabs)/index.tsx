import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";
import { useDevotionalSession } from "@/lib/devotional-context";
import Colors from "@/constants/colors";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

function WeekCalendar() {
    const { theme } = useTheme();
    const today = new Date();
    const dayOfWeek = today.getDay();

    return (
        <View style={styles.weekRow}>
            {WEEKDAYS.map((label, i) => {
                const isToday = i === dayOfWeek;
                return (
                    <View key={i} style={styles.weekDayCol}>
                        <Text
                            style={[
                                styles.weekDayLabel,
                                { color: isToday ? Colors.palette.coral : theme.textSecondary },
                            ]}
                        >
                            {label}
                        </Text>
                        <View
                            style={[
                                styles.weekDayDot,
                                isToday
                                    ? { backgroundColor: Colors.palette.coral }
                                    : { backgroundColor: theme.card },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.weekDayNumber,
                                    { color: isToday ? "#fff" : theme.textSecondary },
                                ]}
                            >
                                {today.getDate() - dayOfWeek + i}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

interface DevotionalCard {
    icon: string;
    title: string;
    time: string;
    blockType: string;
}

const DAILY_SECTIONS: DevotionalCard[] = [
    { icon: "✍️", title: "Citação Diária", time: "", blockType: "quote" },
    { icon: "📖", title: "Passagem", time: "1 MIN", blockType: "scripture" },
    { icon: "💬", title: "Devocional", time: "5 MIN", blockType: "reflection" },
    { icon: "🙏", title: "Oração", time: "1 MIN", blockType: "prayer" },
];

export default function TodayScreen() {
    const { theme } = useTheme();
    const { todaySeries, loadTodaySeries, isLoadingSeries } = useDevotionalSession();

    useEffect(() => {
        loadTodaySeries();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.dateText, { color: Colors.palette.coral }]}>
                            {new Date()
                                .toLocaleDateString("pt-BR", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })
                                .toUpperCase()}
                        </Text>
                        <Text style={[styles.title, { color: theme.text }]}>Hoje</Text>
                    </View>
                    <Pressable onPress={() => router.push("/profile")} hitSlop={12}>
                        <View style={[styles.avatarSmall, { borderColor: Colors.palette.coral }]}>
                            <Ionicons name="person" size={18} color={Colors.palette.coral} />
                        </View>
                    </Pressable>
                </View>

                {/* Week Calendar */}
                <WeekCalendar />

                {/* Daily Devotional Section */}
                <Text style={[styles.sectionLabel, { color: theme.text }]}>
                    DEVOCIONAL DIÁRIO
                </Text>

                {DAILY_SECTIONS.map((section, index) => (
                    <Pressable
                        key={index}
                        style={[styles.card, { backgroundColor: theme.card }]}
                        onPress={() => {
                            // If there are series with days, start a session
                            // For now, navigate to show the block type preview
                            router.push("/session" as any);
                        }}
                    >
                        <View style={styles.cardRow}>
                            <Text style={styles.cardIcon}>{section.icon}</Text>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>
                                {section.title}
                            </Text>
                            {section.time ? (
                                <Text style={[styles.cardTime, { color: theme.textSecondary }]}>
                                    {section.time}
                                </Text>
                            ) : null}
                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color={theme.textSecondary}
                                style={{ marginLeft: 8 }}
                            />
                        </View>
                    </Pressable>
                ))}

                {/* Series catalog */}
                {todaySeries.length > 0 && (
                    <>
                        <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 24 }]}>
                            SÉRIES DISPONÍVEIS
                        </Text>
                        {todaySeries.map((series) => (
                            <Pressable
                                key={series.id}
                                style={[styles.seriesCard, { backgroundColor: theme.card }]}
                            >
                                <View style={[styles.seriesImagePlaceholder, { backgroundColor: Colors.palette.coral + "20" }]}>
                                    <Text style={{ fontSize: 32 }}>📚</Text>
                                </View>
                                <View style={styles.seriesInfo}>
                                    <Text style={[styles.seriesTitle, { color: theme.text }]}>
                                        {series.title}
                                    </Text>
                                    {series.description ? (
                                        <Text
                                            style={[styles.seriesDesc, { color: theme.textSecondary }]}
                                            numberOfLines={2}
                                        >
                                            {series.description}
                                        </Text>
                                    ) : null}
                                </View>
                            </Pressable>
                        ))}
                    </>
                )}

                {isLoadingSeries && (
                    <ActivityIndicator
                        size="small"
                        color={Colors.palette.coral}
                        style={{ marginTop: 20 }}
                    />
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
    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    dateText: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 1,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
    },
    avatarSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF0EC",
    },

    // Week
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    weekDayCol: {
        alignItems: "center",
        gap: 6,
    },
    weekDayLabel: {
        fontSize: 12,
        fontWeight: "600",
    },
    weekDayDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    weekDayNumber: {
        fontSize: 13,
        fontWeight: "700",
    },

    // Section
    sectionLabel: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.5,
        marginBottom: 12,
    },

    // Card
    card: {
        borderRadius: 16,
        padding: 18,
        marginBottom: 8,
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
    },
    cardTime: {
        fontSize: 13,
        fontWeight: "500",
    },

    // Series
    seriesCard: {
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    seriesImagePlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    seriesInfo: {
        flex: 1,
        marginLeft: 14,
    },
    seriesTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
    },
    seriesDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
});
