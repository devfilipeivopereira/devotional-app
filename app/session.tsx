import React from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";
import { useDevotionalSession } from "@/lib/devotional-context";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import Colors from "@/constants/colors";

export default function SessionScreen() {
    const { theme } = useTheme();
    const { session, nextBlock, previousBlock, completeSession, saveJournalEntry, resetSession } =
        useDevotionalSession();
    const params = useLocalSearchParams<{ dayId?: string }>();

    const { startSession } = useDevotionalSession();

    React.useEffect(() => {
        if (params.dayId) {
            startSession(params.dayId);
        }
    }, [params.dayId]);

    // Loading
    if (session.isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={Colors.palette.coral} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Carregando sessão...
                </Text>
            </SafeAreaView>
        );
    }

    // Error
    if (session.error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: Colors.palette.coral }]}>
                    {session.error}
                </Text>
                <Pressable
                    onPress={() => {
                        resetSession();
                        router.back();
                    }}
                    style={[styles.backButton, { borderColor: theme.border }]}
                >
                    <Text style={[styles.backButtonText, { color: theme.text }]}>Voltar</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    // Complete
    if (session.isComplete) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={styles.completeEmoji}>🎉</Text>
                <Text style={[styles.completeTitle, { color: theme.text }]}>
                    Sessão Concluída!
                </Text>
                <Text style={[styles.completeSubtitle, { color: theme.textSecondary }]}>
                    {session.day?.title ?? "Devocional do dia"}
                </Text>
                <Pressable
                    onPress={async () => {
                        await completeSession();
                        resetSession();
                        router.back();
                    }}
                    style={[styles.completeButton, { backgroundColor: Colors.palette.coral }]}
                >
                    <Text style={styles.completeButtonText}>VOLTAR AO INÍCIO</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    // No blocks loaded
    if (!session.blocks.length) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Nenhum conteúdo disponível
                </Text>
            </SafeAreaView>
        );
    }

    const currentBlock = session.blocks[session.currentBlockIndex];
    const totalBlocks = session.blocks.length;
    const progress = (session.currentBlockIndex + 1) / totalBlocks;

    return (
        <View style={[styles.sessionContainer, { backgroundColor: theme.background }]}>
            {/* Progress Bar */}
            <SafeAreaView style={styles.progressBarContainer}>
                <View style={styles.progressHeader}>
                    <Pressable
                        onPress={() => {
                            resetSession();
                            router.back();
                        }}
                        hitSlop={12}
                    >
                        <Ionicons name="close" size={24} color={theme.text} />
                    </Pressable>
                    <View style={[styles.progressBarTrack, { backgroundColor: theme.card }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    backgroundColor: Colors.palette.coral,
                                    width: `${progress * 100}%`,
                                },
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                        {session.currentBlockIndex + 1}/{totalBlocks}
                    </Text>
                </View>
            </SafeAreaView>

            {/* Block Content */}
            {currentBlock && (
                <BlockRenderer
                    block={currentBlock}
                    onNext={nextBlock}
                    onSaveJournal={saveJournalEntry}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    sessionContainer: {
        flex: 1,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    backButton: {
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: "600",
    },

    // Progress
    progressBarContainer: {
        zIndex: 10,
    },
    progressHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
    },
    progressBarTrack: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        fontWeight: "600",
        minWidth: 30,
        textAlign: "right",
    },

    // Complete
    completeEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    completeTitle: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 8,
    },
    completeSubtitle: {
        fontSize: 16,
        marginBottom: 32,
    },
    completeButton: {
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 16,
    },
    completeButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 1,
    },
});
