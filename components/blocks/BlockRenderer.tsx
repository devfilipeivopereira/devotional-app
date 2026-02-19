import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import type { DevotionalBlock } from "@/shared/schema";
import Colors from "@/constants/colors";
import { Typography } from "@/constants/design";
import { useTheme } from "@/lib/useTheme";

// ─── Quote Block ─────────────────────────────────────────────
export function QuoteBlock({
    block,
    onNext,
}: {
    block: DevotionalBlock;
    onNext: () => void;
}) {
    const content = block.content as { text: string; author: string };

    return (
        <Pressable onPress={onNext} style={styles.fullScreen}>
            <View style={[styles.fullScreen, styles.quoteContainer]}>
                <View style={styles.quoteOverlay} />
                <View style={styles.quoteContent}>
                    <Text style={styles.quoteText}>"{content.text}"</Text>
                    <Text style={styles.quoteAuthor}>— {content.author}</Text>
                </View>
                <Text style={styles.tapHint}>TOQUE PARA CONCLUIR</Text>
            </View>
        </Pressable>
    );
}

// ─── Scripture Block ─────────────────────────────────────────
export function ScriptureBlock({
    block,
    onNext,
}: {
    block: DevotionalBlock;
    onNext: () => void;
}) {
    const { theme } = useTheme();
    const content = block.content as {
        book: string;
        chapter: string;
        verseStart: string;
        verseEnd: string;
        text: string;
    };

    return (
        <Pressable onPress={onNext} style={[styles.blockContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.scriptureRef, { color: Colors.palette.coral }]}>
                {content.book} {content.chapter}:{content.verseStart}
                {content.verseEnd ? `-${content.verseEnd}` : ""}
            </Text>
            <Text style={[styles.scriptureText, { color: theme.text }]}>
                {content.text}
            </Text>
            <Text style={[styles.tapHintDark, { color: theme.textSecondary }]}>
                TOQUE EM QUALQUER LUGAR PARA CONTINUAR
            </Text>
        </Pressable>
    );
}

// ─── Reflection Block ────────────────────────────────────────
export function ReflectionBlock({
    block,
    onNext,
}: {
    block: DevotionalBlock;
    onNext: () => void;
}) {
    const { theme } = useTheme();
    const content = block.content as { text: string };

    return (
        <Pressable onPress={onNext} style={[styles.blockContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.reflectionTitle, { color: theme.text }]}>
                Devocional
            </Text>
            <Text style={[styles.reflectionText, { color: theme.text }]}>
                {content.text}
            </Text>
            <Text style={[styles.tapHintDark, { color: theme.textSecondary }]}>
                TOQUE EM QUALQUER LUGAR PARA CONTINUAR
            </Text>
        </Pressable>
    );
}

// ─── Prayer Block ────────────────────────────────────────────
export function PrayerBlock({
    block,
    onNext,
}: {
    block: DevotionalBlock;
    onNext: () => void;
}) {
    const content = block.content as { text: string };

    return (
        <Pressable onPress={onNext} style={styles.fullScreen}>
            <View style={[styles.fullScreen, styles.prayerContainer]}>
                <View style={styles.prayerOverlay} />
                <View style={styles.prayerContent}>
                    <Text style={styles.prayerLabel}>🙏 ORAÇÃO</Text>
                    <Text style={styles.prayerText}>{content.text}</Text>
                </View>
                <Text style={styles.tapHint}>TOQUE PARA CONCLUIR</Text>
            </View>
        </Pressable>
    );
}

// ─── Breathing Block ─────────────────────────────────────────
export function BreathingBlock({
    block,
    onNext,
}: {
    block: DevotionalBlock;
    onNext: () => void;
}) {
    const content = block.content as {
        durationSeconds: number;
        instructions: string;
    };
    const [phase, setPhase] = React.useState<"inspire" | "expire">("inspire");

    React.useEffect(() => {
        const interval = setInterval(() => {
            setPhase((p) => (p === "inspire" ? "expire" : "inspire"));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Pressable onPress={onNext} style={styles.fullScreen}>
            <View style={[styles.fullScreen, styles.breathingContainer]}>
                <Text style={styles.breathingLabel}>RESPIRAÇÃO</Text>
                <View
                    style={[
                        styles.breathCircle,
                        phase === "inspire"
                            ? styles.breathCircleExpand
                            : styles.breathCircleShrink,
                    ]}
                />
                <Text style={styles.breathingPhase}>
                    {phase === "inspire" ? "INSPIRE" : "EXPIRE"}
                </Text>
                <Text style={styles.breathingInstructions}>{content.instructions}</Text>
                <Text style={styles.tapHint}>TOQUE PARA PULAR</Text>
            </View>
        </Pressable>
    );
}

// ─── Action Block ────────────────────────────────────────────
export function ActionBlock({
    block,
    onNext,
}: {
    block: DevotionalBlock;
    onNext: () => void;
}) {
    const { theme } = useTheme();
    const content = block.content as {
        text: string;
        callToAction: string;
        link?: string;
    };

    return (
        <View style={[styles.blockContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.actionText, { color: theme.text }]}>
                {content.text}
            </Text>
            <Pressable
                onPress={onNext}
                style={[styles.actionButton, { backgroundColor: Colors.palette.coral }]}
            >
                <Text style={styles.actionButtonText}>{content.callToAction}</Text>
            </Pressable>
        </View>
    );
}

// ─── Journal Prompt Block ────────────────────────────────────
export function JournalPromptBlock({
    block,
    onNext,
    onSaveJournal,
}: {
    block: DevotionalBlock;
    onNext: () => void;
    onSaveJournal: (blockId: string, content: string) => Promise<void>;
}) {
    const { theme } = useTheme();
    const content = block.content as { prompt: string };
    const [entry, setEntry] = React.useState("");
    const [saving, setSaving] = React.useState(false);

    const handleSave = async () => {
        if (!entry.trim()) {
            onNext();
            return;
        }
        setSaving(true);
        await onSaveJournal(block.id, entry.trim());
        setSaving(false);
        onNext();
    };

    // Inline import to avoid circular dependency
    const { TextInput } = require("react-native");

    return (
        <View style={[styles.blockContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.journalLabel, { color: Colors.palette.coral }]}>
                ✍️ REFLEXÃO
            </Text>
            <Text style={[styles.journalPrompt, { color: theme.text }]}>
                {content.prompt}
            </Text>
            <TextInput
                style={[
                    styles.journalInput,
                    { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                ]}
                multiline
                numberOfLines={6}
                placeholder="Escreva sua reflexão..."
                placeholderTextColor={theme.textSecondary}
                value={entry}
                onChangeText={setEntry}
                textAlignVertical="top"
            />
            <Pressable
                onPress={handleSave}
                disabled={saving}
                style={[
                    styles.actionButton,
                    { backgroundColor: Colors.palette.black, marginTop: 16 },
                ]}
            >
                <Text style={styles.actionButtonText}>
                    {saving ? "Salvando..." : entry.trim() ? "SALVAR E CONTINUAR" : "PULAR"}
                </Text>
            </Pressable>
        </View>
    );
}

// ─── Image Meditation Block ──────────────────────────────────
export function ImageMeditationBlock({
    block,
    onNext,
}: {
    block: DevotionalBlock;
    onNext: () => void;
}) {
    const content = block.content as { imageId: string; caption: string };

    return (
        <Pressable onPress={onNext} style={styles.fullScreen}>
            <View style={[styles.fullScreen, styles.imageMeditationContainer]}>
                <Text style={styles.imageMeditationCaption}>{content.caption}</Text>
                <Text style={styles.tapHint}>TOQUE PARA CONTINUAR</Text>
            </View>
        </Pressable>
    );
}

// ─── Block Renderer ──────────────────────────────────────────
export default function BlockRenderer({
    block,
    onNext,
    onSaveJournal,
}: {
    block: DevotionalBlock;
    onNext: () => void;
    onSaveJournal: (blockId: string, content: string) => Promise<void>;
}) {
    switch (block.blockType as string) {
        case "quote":
            return <QuoteBlock block={block} onNext={onNext} />;
        case "scripture":
            return <ScriptureBlock block={block} onNext={onNext} />;
        case "reflection":
            return <ReflectionBlock block={block} onNext={onNext} />;
        case "prayer":
            return <PrayerBlock block={block} onNext={onNext} />;
        case "breathing":
            return <BreathingBlock block={block} onNext={onNext} />;
        case "action":
            return <ActionBlock block={block} onNext={onNext} />;
        case "journal_prompt":
            return (
                <JournalPromptBlock
                    block={block}
                    onNext={onNext}
                    onSaveJournal={onSaveJournal}
                />
            );
        case "image_meditation":
            return <ImageMeditationBlock block={block} onNext={onNext} />;
        default:
            return (
                <View style={[styles.blockContainer, { padding: 40 }]}>
                    <Text style={{ color: "#999", textAlign: "center" }}>
                        Bloco desconhecido: {block.blockType}
                    </Text>
                </View>
            );
    }
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        width: "100%",
    },
    blockContainer: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
    },

    // Quote
    quoteContainer: {
        backgroundColor: "#1A1A2E",
        justifyContent: "center",
        alignItems: "center",
    },
    quoteOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    quoteContent: {
        padding: 32,
        zIndex: 1,
        alignItems: "center",
    },
    quoteText: {
        ...Typography.quote,
        color: "#fff",
        textAlign: "center",
        marginBottom: 20,
    },
    quoteAuthor: {
        ...Typography.caption,
        color: "rgba(255,255,255,0.7)",
        fontSize: 16,
        fontWeight: "600",
    },

    // Scripture
    scriptureRef: {
        ...Typography.label,
        marginBottom: 16,
    },
    scriptureText: {
        ...Typography.contentLarge,
    },

    // Reflection
    reflectionTitle: {
        ...Typography.label,
        marginBottom: 16,
    },
    reflectionText: {
        ...Typography.contentMedium,
    },

    // Prayer
    prayerContainer: {
        backgroundColor: "#1A1A2E",
        justifyContent: "center",
        alignItems: "center",
    },
    prayerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    prayerContent: {
        padding: 32,
        zIndex: 1,
        alignItems: "center",
    },
    prayerLabel: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 2,
        marginBottom: 24,
    },
    prayerText: {
        ...Typography.contentMedium,
        color: "#fff",
        textAlign: "center",
    },

    // Breathing
    breathingContainer: {
        backgroundColor: "#0F1923",
        justifyContent: "center",
        alignItems: "center",
    },
    breathingLabel: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 3,
        marginBottom: 40,
    },
    breathCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.palette.coral,
        opacity: 0.6,
    },
    breathCircleExpand: {
        width: 160,
        height: 160,
        borderRadius: 80,
        opacity: 0.8,
    },
    breathCircleShrink: {
        width: 100,
        height: 100,
        borderRadius: 50,
        opacity: 0.4,
    },
    breathingPhase: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: 4,
        marginTop: 32,
    },
    breathingInstructions: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
        marginTop: 16,
        textAlign: "center",
        paddingHorizontal: 40,
    },

    // Action
    actionText: {
        ...Typography.bodyLarge,
        marginBottom: 24,
    },
    actionButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: "center",
    },
    actionButtonText: {
        ...Typography.button,
        color: "#fff",
    },

    // Journal
    journalLabel: {
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    journalPrompt: {
        ...Typography.headingMedium,
        marginBottom: 20,
    },
    journalInput: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        lineHeight: 24,
        minHeight: 150,
    },

    // Image Meditation
    imageMeditationContainer: {
        backgroundColor: "#1A1A2E",
        justifyContent: "center",
        alignItems: "center",
    },
    imageMeditationCaption: {
        ...Typography.contentLarge,
        color: "#fff",
        textAlign: "center",
        paddingHorizontal: 32,
    },

    // Shared
    tapHint: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 2,
        textAlign: "center",
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
    },
    tapHintDark: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
        textAlign: "center",
        marginTop: 40,
    },
});
