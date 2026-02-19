// Devotional CMS Types — mirrors Supabase schema

export interface DevotionalSeries {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface DevotionalDay {
    id: string;
    series_id: string;
    day_number: number;
    title: string;
    description: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export type BlockType =
    | "quote"
    | "scripture"
    | "reflection"
    | "prayer"
    | "breathing"
    | "action"
    | "journal_prompt"
    | "image_meditation";

export interface DevotionalBlock {
    id: string;
    day_id: string;
    block_type: BlockType;
    content: Record<string, unknown>;
    order: number;
    created_at: string;
    updated_at: string;
}

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
    quote: "Citação",
    scripture: "Escritura",
    reflection: "Reflexão",
    prayer: "Oração",
    breathing: "Respiração",
    action: "Ação",
    journal_prompt: "Diário",
    image_meditation: "Meditação com Imagem",
};

export const BLOCK_TYPE_ICONS: Record<BlockType, string> = {
    quote: "💬",
    scripture: "📖",
    reflection: "💭",
    prayer: "🙏",
    breathing: "🌬️",
    action: "⚡",
    journal_prompt: "📝",
    image_meditation: "🖼️",
};

// Content shapes for each block type
export interface QuoteContent {
    text: string;
    author: string;
}

export interface ScriptureContent {
    book: string;
    chapter: string;
    verse_start: string;
    verse_end: string;
    text: string;
}

export interface ReflectionContent {
    text: string;
}

export interface PrayerContent {
    text: string;
}

export interface BreathingContent {
    duration_seconds: number;
    instructions: string;
}

export interface ActionContent {
    text: string;
    call_to_action: string;
    link?: string;
}

export interface JournalPromptContent {
    prompt: string;
}

export interface ImageMeditationContent {
    image_id: string;
    caption: string;
}
