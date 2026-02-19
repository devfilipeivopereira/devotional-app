import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    type ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type {
    DevotionalBlock,
    DevotionalDay,
    DevotionalSeries,
    DevotionalProgress,
    BlockType,
} from "@/shared/schema";

// ─── Types ───────────────────────────────────────────────────
export interface SessionState {
    series: DevotionalSeries | null;
    day: DevotionalDay | null;
    blocks: DevotionalBlock[];
    currentBlockIndex: number;
    isLoading: boolean;
    isComplete: boolean;
    error: string | null;
}

interface DevotionalContextValue {
    session: SessionState;
    startSession: (dayId: string) => Promise<void>;
    nextBlock: () => void;
    previousBlock: () => void;
    goToBlock: (index: number) => void;
    completeSession: () => Promise<void>;
    saveJournalEntry: (blockId: string, content: string) => Promise<void>;
    resetSession: () => void;
    todaySeries: DevotionalSeries[];
    loadTodaySeries: () => Promise<void>;
    isLoadingSeries: boolean;
}

const INITIAL_SESSION: SessionState = {
    series: null,
    day: null,
    blocks: [],
    currentBlockIndex: 0,
    isLoading: false,
    isComplete: false,
    error: null,
};

const DevotionalContext = createContext<DevotionalContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────
export function DevotionalProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<SessionState>(INITIAL_SESSION);
    const [todaySeries, setTodaySeries] = useState<DevotionalSeries[]>([]);
    const [isLoadingSeries, setIsLoadingSeries] = useState(false);

    const loadTodaySeries = useCallback(async () => {
        if (!isSupabaseConfigured) return;
        setIsLoadingSeries(true);
        try {
            const { data, error } = await supabase
                .from("devotional_series")
                .select("*")
                .eq("is_published", true)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setTodaySeries(data ?? []);
        } catch (err: any) {
            console.error("Error loading series:", err.message);
        } finally {
            setIsLoadingSeries(false);
        }
    }, []);

    const startSession = useCallback(async (dayId: string) => {
        if (!isSupabaseConfigured) return;
        setSession((s) => ({ ...s, isLoading: true, error: null }));

        try {
            // Fetch day + blocks + series
            const { data: day, error: dayErr } = await supabase
                .from("devotional_days")
                .select("*, devotional_series(*)")
                .eq("id", dayId)
                .single();

            if (dayErr) throw dayErr;

            const { data: blocks, error: blocksErr } = await supabase
                .from("devotional_blocks")
                .select("*")
                .eq("day_id", dayId)
                .order("order", { ascending: true });

            if (blocksErr) throw blocksErr;

            // Check existing progress
            const { data: { user } } = await supabase.auth.getUser();
            let startIndex = 0;

            if (user) {
                const { data: progress } = await supabase
                    .from("devotional_progress")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("day_id", dayId)
                    .single();

                if (progress?.last_block_id && blocks) {
                    const idx = blocks.findIndex((b: DevotionalBlock) => b.id === progress.last_block_id);
                    if (idx >= 0) startIndex = idx;
                }

                // Upsert progress if not exists
                if (!progress) {
                    await supabase.from("devotional_progress").insert({
                        user_id: user.id,
                        day_id: dayId,
                    });
                }
            }

            setSession({
                series: (day as any).devotional_series ?? null,
                day: day as DevotionalDay,
                blocks: blocks ?? [],
                currentBlockIndex: startIndex,
                isLoading: false,
                isComplete: false,
                error: null,
            });
        } catch (err: any) {
            setSession((s) => ({
                ...s,
                isLoading: false,
                error: err.message || "Erro ao carregar sessão",
            }));
        }
    }, []);

    const saveProgress = useCallback(async (blockId: string, dayId: string) => {
        if (!isSupabaseConfigured) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from("devotional_progress")
                .upsert(
                    {
                        user_id: user.id,
                        day_id: dayId,
                        last_block_id: blockId,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id,day_id" }
                );
        } catch (err: any) {
            console.error("Error saving progress:", err.message);
        }
    }, []);

    const nextBlock = useCallback(() => {
        setSession((s) => {
            if (s.currentBlockIndex >= s.blocks.length - 1) {
                return { ...s, isComplete: true };
            }
            const nextIndex = s.currentBlockIndex + 1;
            const nextBlockData = s.blocks[nextIndex];
            if (nextBlockData && s.day) {
                saveProgress(nextBlockData.id, s.day.id);
            }
            return { ...s, currentBlockIndex: nextIndex };
        });
    }, [saveProgress]);

    const previousBlock = useCallback(() => {
        setSession((s) => ({
            ...s,
            currentBlockIndex: Math.max(0, s.currentBlockIndex - 1),
            isComplete: false,
        }));
    }, []);

    const goToBlock = useCallback((index: number) => {
        setSession((s) => ({
            ...s,
            currentBlockIndex: Math.max(0, Math.min(index, s.blocks.length - 1)),
            isComplete: false,
        }));
    }, []);

    const completeSession = useCallback(async () => {
        if (!isSupabaseConfigured || !session.day) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from("devotional_progress")
                .upsert(
                    {
                        user_id: user.id,
                        day_id: session.day.id,
                        completed_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id,day_id" }
                );

            setSession((s) => ({ ...s, isComplete: true }));
        } catch (err: any) {
            console.error("Error completing session:", err.message);
        }
    }, [session.day]);

    const saveJournalEntry = useCallback(
        async (blockId: string, content: string) => {
            if (!isSupabaseConfigured || !session.day) return;
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                await supabase.from("devotional_journal").upsert(
                    {
                        user_id: user.id,
                        day_id: session.day.id,
                        block_id: blockId,
                        content,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id,day_id,block_id" }
                );
            } catch (err: any) {
                console.error("Error saving journal:", err.message);
            }
        },
        [session.day]
    );

    const resetSession = useCallback(() => {
        setSession(INITIAL_SESSION);
    }, []);

    const value = useMemo<DevotionalContextValue>(
        () => ({
            session,
            startSession,
            nextBlock,
            previousBlock,
            goToBlock,
            completeSession,
            saveJournalEntry,
            resetSession,
            todaySeries,
            loadTodaySeries,
            isLoadingSeries,
        }),
        [
            session,
            startSession,
            nextBlock,
            previousBlock,
            goToBlock,
            completeSession,
            saveJournalEntry,
            resetSession,
            todaySeries,
            loadTodaySeries,
            isLoadingSeries,
        ]
    );

    return (
        <DevotionalContext.Provider value={value}>
            {children}
        </DevotionalContext.Provider>
    );
}

// ─── Hooks ───────────────────────────────────────────────────
export function useDevotionalSession() {
    const ctx = useContext(DevotionalContext);
    if (!ctx)
        throw new Error("useDevotionalSession must be used within DevotionalProvider");
    return ctx;
}
