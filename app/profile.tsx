import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/lib/useTheme";
import { useAuth } from "@/lib/AuthContext";
import Colors from "@/constants/colors";

export default function ProfileScreen() {
    const { theme } = useTheme();
    const { user, signOut } = useAuth();

    const stats = [
        { icon: "⚡", label: "MAIOR\nSEQUÊNCIA", value: "0" },
        { icon: "✅", label: "DEVOCIONAIS\nDIÁRIOS", value: "0" },
        { icon: "👥", label: "AMIGOS\nINTRODUZIDOS", value: "0" },
    ];

    const actions = [
        { icon: "create-outline" as const, label: "Diário", action: "ABRIR", color: Colors.palette.coral },
        { icon: "hand-left-outline" as const, label: "Envie uma oração", action: "ORAR", color: Colors.palette.coral },
        { icon: "people-outline" as const, label: "Convide um amigo", action: "CONVIDAR", color: Colors.palette.coral },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: theme.text }]}>MEU PERFIL</Text>
                <Ionicons name="settings-outline" size={24} color={theme.text} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <View style={[styles.avatar, { borderColor: Colors.palette.coral }]}>
                        <Text style={styles.avatarLetter}>
                            {user?.email?.[0]?.toUpperCase() || "D"}
                        </Text>
                    </View>
                    <View style={styles.nameSection}>
                        <Text style={[styles.name, { color: theme.text }]}>
                            {user?.email?.split("@")[0] || "Usuário"}
                        </Text>
                        <Text style={[styles.email, { color: theme.textSecondary }]}>
                            {user?.email || ""}
                        </Text>
                    </View>
                </View>

                <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statItem}>
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                {stat.label}
                            </Text>
                            <Text style={[styles.statValue, { color: theme.text }]}>
                                {stat.value}
                            </Text>
                        </View>
                    ))}
                </View>

                {actions.map((action, index) => (
                    <View key={index} style={[styles.actionCard, { backgroundColor: theme.card }]}>
                        <View style={styles.actionRow}>
                            <Ionicons name={action.icon} size={22} color={theme.text} />
                            <Text style={[styles.actionLabel, { color: theme.text }]}>
                                {action.label}
                            </Text>
                            <Text style={[styles.actionButton, { color: action.color }]}>
                                {action.action}
                            </Text>
                        </View>
                    </View>
                ))}

                <Pressable
                    style={[styles.signOutButton, { borderColor: Colors.palette.coral }]}
                    onPress={signOut}
                >
                    <Text style={[styles.signOutText, { color: Colors.palette.coral }]}>
                        Sair
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 60,
    },
    avatarSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF0EC",
    },
    avatarLetter: {
        fontSize: 28,
        fontWeight: "700",
        color: Colors.palette.coral,
    },
    nameSection: {
        marginLeft: 16,
    },
    name: {
        fontSize: 20,
        fontWeight: "700",
    },
    email: {
        fontSize: 13,
        marginTop: 2,
    },
    statsCard: {
        flexDirection: "row",
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
    },
    statIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.5,
        textAlign: "center",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "700",
    },
    actionCard: {
        borderRadius: 16,
        padding: 18,
        marginBottom: 8,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionLabel: {
        fontSize: 15,
        fontWeight: "600",
        flex: 1,
        marginLeft: 12,
    },
    actionButton: {
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    signOutButton: {
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        marginTop: 20,
    },
    signOutText: {
        fontSize: 15,
        fontWeight: "700",
    },
});
