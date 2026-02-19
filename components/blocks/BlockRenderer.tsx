import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { DevotionalBlock } from "@/shared/schema";
import Colors from "@/constants/colors";
import { Typography } from "@/constants/design";
import { useTheme } from "@/lib/useTheme";

function readContent(content: unknown, ...keys: string[]): string {
  if (!content || typeof content !== "object") return "";
  const value = keys
    .map((key) => (content as Record<string, unknown>)[key])
    .find((v) => typeof v === "string" && v.length > 0);
  return (value as string) || "";
}

function readNumber(content: unknown, ...keys: string[]): number {
  if (!content || typeof content !== "object") return 0;
  const value = keys
    .map((key) => (content as Record<string, unknown>)[key])
    .find((v) => typeof v === "number" && Number.isFinite(v));
  return (value as number) || 0;
}

export function QuoteBlock({ block, onNext }: { block: DevotionalBlock; onNext: () => void }) {
  const text = readContent(block.content, "text");
  const author = readContent(block.content, "author");

  return (
    <Pressable onPress={onNext} style={styles.fullScreen}>
      <View style={[styles.fullScreen, styles.quoteContainer]}>
        <View style={styles.quoteOverlay} />
        <View style={styles.quoteContent}>
          <Text style={styles.quoteText}>{'"'}{text}{'"'}</Text>
          <Text style={styles.quoteAuthor}>- {author}</Text>
        </View>
        <Text style={styles.tapHint}>TOQUE PARA CONCLUIR</Text>
      </View>
    </Pressable>
  );
}

export function ScriptureBlock({ block, onNext }: { block: DevotionalBlock; onNext: () => void }) {
  const { theme } = useTheme();
  const book = readContent(block.content, "book");
  const chapter = readContent(block.content, "chapter");
  const verseStart = readContent(block.content, "verse_start", "verseStart");
  const verseEnd = readContent(block.content, "verse_end", "verseEnd");
  const text = readContent(block.content, "text");

  return (
    <Pressable onPress={onNext} style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.scriptureRef, { color: Colors.palette.coral }]}>
        {book} {chapter}:{verseStart}
        {verseEnd ? `-${verseEnd}` : ""}
      </Text>
      <Text style={[styles.scriptureText, { color: theme.text }]}>{text}</Text>
      <Text style={[styles.tapHintDark, { color: theme.textSecondary }]}>TOQUE EM QUALQUER LUGAR PARA CONTINUAR</Text>
    </Pressable>
  );
}

export function ReflectionBlock({ block, onNext }: { block: DevotionalBlock; onNext: () => void }) {
  const { theme } = useTheme();
  const text = readContent(block.content, "text");

  return (
    <Pressable onPress={onNext} style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.reflectionTitle, { color: theme.text }]}>Devocional</Text>
      <Text style={[styles.reflectionText, { color: theme.text }]}>{text}</Text>
      <Text style={[styles.tapHintDark, { color: theme.textSecondary }]}>TOQUE EM QUALQUER LUGAR PARA CONTINUAR</Text>
    </Pressable>
  );
}

export function PrayerBlock({ block, onNext }: { block: DevotionalBlock; onNext: () => void }) {
  const text = readContent(block.content, "text");

  return (
    <Pressable onPress={onNext} style={styles.fullScreen}>
      <View style={[styles.fullScreen, styles.prayerContainer]}>
        <View style={styles.prayerOverlay} />
        <View style={styles.prayerContent}>
          <Text style={styles.prayerLabel}>ORACAO</Text>
          <Text style={styles.prayerText}>{text}</Text>
        </View>
        <Text style={styles.tapHint}>TOQUE PARA CONCLUIR</Text>
      </View>
    </Pressable>
  );
}

export function BreathingBlock({ block, onNext }: { block: DevotionalBlock; onNext: () => void }) {
  const instructions = readContent(block.content, "instructions");
  const durationSeconds = readNumber(block.content, "duration_seconds", "durationSeconds");
  const [phase, setPhase] = React.useState<"inspire" | "expire">("inspire");

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p === "inspire" ? "expire" : "inspire"));
    }, Math.max(1000, Math.floor((durationSeconds || 8) * 500)));
    return () => clearInterval(interval);
  }, [durationSeconds]);

  return (
    <Pressable onPress={onNext} style={styles.fullScreen}>
      <View style={[styles.fullScreen, styles.breathingContainer]}>
        <Text style={styles.breathingLabel}>RESPIRACAO</Text>
        <View
          style={[
            styles.breathCircle,
            phase === "inspire" ? styles.breathCircleExpand : styles.breathCircleShrink,
          ]}
        />
        <Text style={styles.breathingPhase}>{phase === "inspire" ? "INSPIRE" : "EXPIRE"}</Text>
        <Text style={styles.breathingInstructions}>{instructions}</Text>
        <Text style={styles.tapHint}>TOQUE PARA PULAR</Text>
      </View>
    </Pressable>
  );
}

export function ActionBlock({ block, onNext }: { block: DevotionalBlock; onNext: () => void }) {
  const { theme } = useTheme();
  const text = readContent(block.content, "text");
  const callToAction = readContent(block.content, "call_to_action", "callToAction");

  return (
    <View style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.actionText, { color: theme.text }]}>{text}</Text>
      <Pressable onPress={onNext} style={[styles.actionButton, { backgroundColor: Colors.palette.coral }]}>
        <Text style={styles.actionButtonText}>{callToAction}</Text>
      </Pressable>
    </View>
  );
}

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
  const prompt = readContent(block.content, "prompt");
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

  const { TextInput } = require("react-native");

  return (
    <View style={[styles.blockContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.journalLabel, { color: Colors.palette.coral }]}>REFLEXAO</Text>
      <Text style={[styles.journalPrompt, { color: theme.text }]}>{prompt}</Text>
      <TextInput
        style={[
          styles.journalInput,
          { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
        ]}
        multiline
        numberOfLines={6}
        placeholder="Escreva sua reflexao..."
        placeholderTextColor={theme.textSecondary}
        value={entry}
        onChangeText={setEntry}
        textAlignVertical="top"
      />
      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={[styles.actionButton, { backgroundColor: Colors.palette.black, marginTop: 16 }]}
      >
        <Text style={styles.actionButtonText}>{saving ? "Salvando..." : entry.trim() ? "SALVAR E CONTINUAR" : "PULAR"}</Text>
      </Pressable>
    </View>
  );
}

export function ImageMeditationBlock({ block, onNext }: { block: DevotionalBlock; onNext: () => void }) {
  const caption = readContent(block.content, "caption");

  return (
    <Pressable onPress={onNext} style={styles.fullScreen}>
      <View style={[styles.fullScreen, styles.imageMeditationContainer]}>
        <Text style={styles.imageMeditationCaption}>{caption}</Text>
        <Text style={styles.tapHint}>TOQUE PARA CONTINUAR</Text>
      </View>
    </Pressable>
  );
}

export default function BlockRenderer({
  block,
  onNext,
  onSaveJournal,
}: {
  block: DevotionalBlock;
  onNext: () => void;
  onSaveJournal: (blockId: string, content: string) => Promise<void>;
}) {
  const blockType =
    ((block as unknown as { block_type?: string; blockType?: string }).block_type ||
      (block as unknown as { block_type?: string; blockType?: string }).blockType ||
      "") as string;

  switch (blockType) {
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
      return <JournalPromptBlock block={block} onNext={onNext} onSaveJournal={onSaveJournal} />;
    case "image_meditation":
      return <ImageMeditationBlock block={block} onNext={onNext} />;
    default:
      return (
        <View style={[styles.blockContainer, { padding: 40 }]}>
          <Text style={{ color: "#999", textAlign: "center" }}>Bloco desconhecido: {blockType || "(vazio)"}</Text>
        </View>
      );
  }
}

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

  scriptureRef: {
    ...Typography.label,
    marginBottom: 16,
  },
  scriptureText: {
    ...Typography.contentLarge,
  },

  reflectionTitle: {
    ...Typography.label,
    marginBottom: 16,
  },
  reflectionText: {
    ...Typography.contentMedium,
  },

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
