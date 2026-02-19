"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type {
    DevotionalSeries,
    DevotionalDay,
    DevotionalBlock,
    BlockType,
} from "@/lib/types";
import { BLOCK_TYPE_LABELS, BLOCK_TYPE_ICONS } from "@/lib/types";

// ─── Block Content Forms ────────────────────────────────────

function BlockContentForm({
    blockType,
    content,
    onChange,
}: {
    blockType: BlockType;
    content: Record<string, unknown>;
    onChange: (c: Record<string, unknown>) => void;
}) {
    const set = (key: string, value: unknown) =>
        onChange({ ...content, [key]: value });

    switch (blockType) {
        case "quote":
            return (
                <>
                    <div className="form-group">
                        <label className="form-label">💬 Texto da Citação</label>
                        <textarea
                            className="form-textarea"
                            value={(content.text as string) || ""}
                            onChange={(e) => set("text", e.target.value)}
                            placeholder="Porque Deus amou o mundo..."
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">✍️ Autor / Referência</label>
                        <input
                            className="form-input"
                            value={(content.author as string) || ""}
                            onChange={(e) => set("author", e.target.value)}
                            placeholder="João 3:16"
                        />
                    </div>
                </>
            );

        case "scripture":
            return (
                <>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">📖 Livro</label>
                            <input
                                className="form-input"
                                value={(content.book as string) || ""}
                                onChange={(e) => set("book", e.target.value)}
                                placeholder="Salmos"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">📄 Capítulo</label>
                            <input
                                className="form-input"
                                value={(content.chapter as string) || ""}
                                onChange={(e) => set("chapter", e.target.value)}
                                placeholder="23"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">🔢 Versículo Início</label>
                            <input
                                className="form-input"
                                value={(content.verse_start as string) || ""}
                                onChange={(e) => set("verse_start", e.target.value)}
                                placeholder="1"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">🔢 Versículo Fim</label>
                            <input
                                className="form-input"
                                value={(content.verse_end as string) || ""}
                                onChange={(e) => set("verse_end", e.target.value)}
                                placeholder="6"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            📝 Texto (opcional — se vazio, busca da API)
                        </label>
                        <textarea
                            className="form-textarea"
                            value={(content.text as string) || ""}
                            onChange={(e) => set("text", e.target.value)}
                            placeholder="O Senhor é o meu pastor..."
                        />
                    </div>
                </>
            );

        case "reflection":
            return (
                <div className="form-group">
                    <label className="form-label">💭 Texto da Reflexão</label>
                    <textarea
                        className="form-textarea"
                        value={(content.text as string) || ""}
                        onChange={(e) => set("text", e.target.value)}
                        placeholder="Quando paramos para refletir sobre..."
                        style={{ minHeight: 150 }}
                    />
                </div>
            );

        case "prayer":
            return (
                <div className="form-group">
                    <label className="form-label">🙏 Texto da Oração</label>
                    <textarea
                        className="form-textarea"
                        value={(content.text as string) || ""}
                        onChange={(e) => set("text", e.target.value)}
                        placeholder="Senhor, eu te agradeço por..."
                        style={{ minHeight: 150 }}
                    />
                </div>
            );

        case "breathing":
            return (
                <>
                    <div className="form-group">
                        <label className="form-label">⏱️ Duração (segundos)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={(content.duration_seconds as number) || 60}
                            onChange={(e) =>
                                set("duration_seconds", parseInt(e.target.value) || 60)
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">🌬️ Instruções</label>
                        <textarea
                            className="form-textarea"
                            value={(content.instructions as string) || ""}
                            onChange={(e) => set("instructions", e.target.value)}
                            placeholder="Respire fundo e concentre-se na presença de Deus..."
                        />
                    </div>
                </>
            );

        case "action":
            return (
                <>
                    <div className="form-group">
                        <label className="form-label">⚡ Texto</label>
                        <textarea
                            className="form-textarea"
                            value={(content.text as string) || ""}
                            onChange={(e) => set("text", e.target.value)}
                            placeholder="Hoje, reserve um momento para..."
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">🎯 Call to Action</label>
                            <input
                                className="form-input"
                                value={(content.call_to_action as string) || ""}
                                onChange={(e) => set("call_to_action", e.target.value)}
                                placeholder="Eu aceito este desafio"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">🔗 Link (opcional)</label>
                            <input
                                className="form-input"
                                value={(content.link as string) || ""}
                                onChange={(e) => set("link", e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </>
            );

        case "journal_prompt":
            return (
                <div className="form-group">
                    <label className="form-label">📝 Pergunta / Prompt</label>
                    <textarea
                        className="form-textarea"
                        value={(content.prompt as string) || ""}
                        onChange={(e) => set("prompt", e.target.value)}
                        placeholder="O que Deus está falando ao seu coração hoje?"
                    />
                </div>
            );

        case "image_meditation":
            return (
                <>
                    <div className="form-group">
                        <label className="form-label">🖼️ URL da Imagem</label>
                        <input
                            className="form-input"
                            value={(content.image_id as string) || ""}
                            onChange={(e) => set("image_id", e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">✏️ Legenda</label>
                        <textarea
                            className="form-textarea"
                            value={(content.caption as string) || ""}
                            onChange={(e) => set("caption", e.target.value)}
                            placeholder="Contemple a beleza da criação..."
                        />
                    </div>
                </>
            );

        default:
            return <p>Tipo de bloco desconhecido</p>;
    }
}

// ─── Main Page ──────────────────────────────────────────────

export default function SeriesDetailPage() {
    const params = useParams();
    const router = useRouter();
    const seriesId = params.id as string;

    const [series, setSeries] = useState<DevotionalSeries | null>(null);
    const [days, setDays] = useState<DevotionalDay[]>([]);
    const [selectedDay, setSelectedDay] = useState<DevotionalDay | null>(null);
    const [blocks, setBlocks] = useState<DevotionalBlock[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit series form
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");

    // Create day modal
    const [showCreateDay, setShowCreateDay] = useState(false);
    const [dayForm, setDayForm] = useState({ title: "", description: "" });

    // Create block modal
    const [showCreateBlock, setShowCreateBlock] = useState(false);
    const [blockType, setBlockType] = useState<BlockType | null>(null);
    const [blockContent, setBlockContent] = useState<Record<string, unknown>>({});

    // Edit block modal
    const [editingBlock, setEditingBlock] = useState<DevotionalBlock | null>(null);
    const [editBlockContent, setEditBlockContent] = useState<Record<string, unknown>>({});

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSeries();
    }, [seriesId]);

    const loadSeries = async () => {
        setLoading(true);
        const { data: seriesData } = await supabase
            .from("devotional_series")
            .select("*")
            .eq("id", seriesId)
            .single();

        if (seriesData) {
            setSeries(seriesData);
            setEditTitle(seriesData.title);
            setEditDesc(seriesData.description || "");
        }

        const { data: daysData } = await supabase
            .from("devotional_days")
            .select("*")
            .eq("series_id", seriesId)
            .order("day_number", { ascending: true });

        if (daysData) {
            setDays(daysData);
            if (daysData.length > 0 && !selectedDay) {
                setSelectedDay(daysData[0]);
            }
        }

        setLoading(false);
    };

    const loadBlocks = useCallback(async (dayId: string) => {
        const { data } = await supabase
            .from("devotional_blocks")
            .select("*")
            .eq("day_id", dayId)
            .order("order", { ascending: true });

        if (data) setBlocks(data);
    }, []);

    useEffect(() => {
        if (selectedDay) {
            loadBlocks(selectedDay.id);
        }
    }, [selectedDay, loadBlocks]);

    const handleUpdateSeries = async () => {
        if (!series) return;
        setSaving(true);
        await supabase
            .from("devotional_series")
            .update({ title: editTitle, description: editDesc || null })
            .eq("id", series.id);
        setSaving(false);
        loadSeries();
    };

    const handleCreateDay = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const nextNumber = days.length + 1;

        await supabase.from("devotional_days").insert({
            series_id: seriesId,
            day_number: nextNumber,
            title: dayForm.title,
            description: dayForm.description || null,
        });

        setDayForm({ title: "", description: "" });
        setShowCreateDay(false);
        setSaving(false);
        loadSeries();
    };

    const handleDeleteDay = async (dayId: string) => {
        if (!confirm("Excluir este dia e todos os seus blocos?")) return;
        await supabase.from("devotional_days").delete().eq("id", dayId);
        if (selectedDay?.id === dayId) setSelectedDay(null);
        setBlocks([]);
        loadSeries();
    };

    const handleCreateBlock = async () => {
        if (!blockType || !selectedDay) return;
        setSaving(true);
        const nextOrder = blocks.length + 1;

        await supabase.from("devotional_blocks").insert({
            day_id: selectedDay.id,
            block_type: blockType,
            content: blockContent,
            order: nextOrder,
        });

        setBlockType(null);
        setBlockContent({});
        setShowCreateBlock(false);
        setSaving(false);
        loadBlocks(selectedDay.id);
    };

    const handleUpdateBlock = async () => {
        if (!editingBlock) return;
        setSaving(true);

        await supabase
            .from("devotional_blocks")
            .update({ content: editBlockContent })
            .eq("id", editingBlock.id);

        setEditingBlock(null);
        setEditBlockContent({});
        setSaving(false);
        if (selectedDay) loadBlocks(selectedDay.id);
    };

    const handleDeleteBlock = async (blockId: string) => {
        if (!confirm("Excluir este bloco?")) return;
        await supabase.from("devotional_blocks").delete().eq("id", blockId);
        if (selectedDay) loadBlocks(selectedDay.id);
    };

    const handleMoveBlock = async (
        blockId: string,
        currentOrder: number,
        direction: "up" | "down"
    ) => {
        const newOrder =
            direction === "up" ? currentOrder - 1 : currentOrder + 1;
        const swapBlock = blocks.find((b) => b.order === newOrder);
        if (!swapBlock) return;

        await Promise.all([
            supabase
                .from("devotional_blocks")
                .update({ order: newOrder })
                .eq("id", blockId),
            supabase
                .from("devotional_blocks")
                .update({ order: currentOrder })
                .eq("id", swapBlock.id),
        ]);

        if (selectedDay) loadBlocks(selectedDay.id);
    };

    const getBlockPreview = (block: DevotionalBlock): string => {
        const c = block.content as Record<string, string>;
        switch (block.block_type) {
            case "quote":
                return c.text
                    ? `"${c.text.substring(0, 60)}..." — ${c.author || ""}`
                    : "Sem conteúdo";
            case "scripture":
                return c.book
                    ? `${c.book} ${c.chapter}:${c.verse_start}-${c.verse_end}`
                    : "Sem referência";
            case "reflection":
            case "prayer":
                return c.text ? c.text.substring(0, 80) + "..." : "Sem conteúdo";
            case "breathing":
                return `${c.duration_seconds || 60}s — ${c.instructions?.substring(0, 40) || ""}...`;
            case "action":
                return c.call_to_action || c.text?.substring(0, 60) || "Sem conteúdo";
            case "journal_prompt":
                return c.prompt ? c.prompt.substring(0, 60) + "..." : "Sem prompt";
            case "image_meditation":
                return c.caption ? c.caption.substring(0, 60) + "..." : "Sem legenda";
            default:
                return "—";
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner" />
                Carregando série...
            </div>
        );
    }

    if (!series) {
        return (
            <div className="empty-state">
                <h3>Série não encontrada</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => router.push("/dashboard/series")}
                >
                    ← Voltar
                </button>
            </div>
        );
    }

    const BLOCK_TYPES: BlockType[] = [
        "quote",
        "scripture",
        "reflection",
        "prayer",
        "breathing",
        "action",
        "journal_prompt",
        "image_meditation",
    ];

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                            className="btn btn-secondary btn-sm btn-icon"
                            onClick={() => router.push("/dashboard/series")}
                        >
                            ←
                        </button>
                        <h1 className="page-title">📖 {series.title}</h1>
                        <span
                            className={`badge ${series.is_published ? "badge-published" : "badge-draft"}`}
                        >
                            {series.is_published ? "✅ Publicada" : "📝 Rascunho"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
                {/* Left: Series info + days */}
                <div>
                    {/* Edit Series */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="section-header">
                            <span className="section-icon">⚙️</span> Dados da Série
                        </div>
                        <div className="form-group">
                            <label className="form-label">Título</label>
                            <input
                                className="form-input"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Descrição</label>
                            <textarea
                                className="form-textarea"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                style={{ minHeight: 60 }}
                            />
                        </div>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleUpdateSeries}
                            disabled={saving}
                            style={{ width: "100%" }}
                        >
                            💾 Salvar
                        </button>
                    </div>

                    {/* Days */}
                    <div className="card">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12,
                            }}
                        >
                            <div className="section-header" style={{ marginBottom: 0 }}>
                                <span className="section-icon">📅</span> Dias ({days.length})
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setShowCreateDay(true)}
                            >
                                ✨ +
                            </button>
                        </div>

                        {days.length === 0 ? (
                            <p
                                style={{
                                    fontSize: 13,
                                    color: "var(--text-muted)",
                                    textAlign: "center",
                                    padding: 16,
                                }}
                            >
                                📭 Nenhum dia ainda
                            </p>
                        ) : (
                            days.map((day) => (
                                <div
                                    key={day.id}
                                    onClick={() => setSelectedDay(day)}
                                    className={`day-item ${selectedDay?.id === day.id ? "active" : ""}`}
                                >
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <span className="day-number">{day.day_number}</span>
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color:
                                                        selectedDay?.id === day.id
                                                            ? "var(--coral)"
                                                            : "var(--text)",
                                                }}
                                            >
                                                Dia {day.day_number}
                                            </div>
                                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                                {day.title}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-danger btn-sm btn-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteDay(day.id);
                                        }}
                                        style={{ fontSize: 10, padding: 4, opacity: 0.5 }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Blocks */}
                <div>
                    {selectedDay ? (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                                        📋 Dia {selectedDay.day_number}: {selectedDay.title}
                                    </h3>
                                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                        🧩 {blocks.length} bloco{blocks.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setBlockType(null);
                                        setBlockContent({});
                                        setShowCreateBlock(true);
                                    }}
                                >
                                    ✨ Novo Bloco
                                </button>
                            </div>

                            {/* Block List */}
                            {blocks.length === 0 ? (
                                <div className="card empty-state">
                                    <div className="icon">📄</div>
                                    <h3>Nenhum bloco neste dia</h3>
                                    <p>Adicione blocos de conteúdo para criar a sessão devocional.</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setBlockType(null);
                                            setBlockContent({});
                                            setShowCreateBlock(true);
                                        }}
                                    >
                                        ✨ Novo Bloco
                                    </button>
                                </div>
                            ) : (
                                <div className="block-list">
                                    {blocks.map((block, idx) => (
                                        <div key={block.id} className="block-item">
                                            <div className="block-handle">⠿</div>
                                            <div className="block-icon">
                                                {BLOCK_TYPE_ICONS[block.block_type as BlockType]}
                                            </div>
                                            <div className="block-content">
                                                <div className="block-type-label">
                                                    {BLOCK_TYPE_LABELS[block.block_type as BlockType]}
                                                </div>
                                                <div className="block-preview">
                                                    {getBlockPreview(block)}
                                                </div>
                                            </div>
                                            <div className="block-actions">
                                                <button
                                                    className="btn btn-secondary btn-sm btn-icon"
                                                    onClick={() =>
                                                        handleMoveBlock(block.id, block.order, "up")
                                                    }
                                                    disabled={idx === 0}
                                                    title="Mover para cima"
                                                >
                                                    ⬆️
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm btn-icon"
                                                    onClick={() =>
                                                        handleMoveBlock(block.id, block.order, "down")
                                                    }
                                                    disabled={idx === blocks.length - 1}
                                                    title="Mover para baixo"
                                                >
                                                    ⬇️
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm btn-icon"
                                                    onClick={() => {
                                                        setEditingBlock(block);
                                                        setEditBlockContent(
                                                            block.content as Record<string, unknown>
                                                        );
                                                    }}
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm btn-icon"
                                                    onClick={() => handleDeleteBlock(block.id)}
                                                    title="Excluir"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="card empty-state">
                            <div className="icon">👈</div>
                            <h3>Selecione um dia</h3>
                            <p>Escolha um dia na lista para editar seus blocos.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Day Modal */}
            {showCreateDay && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowCreateDay(false)}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">📅 Novo Dia</h2>
                        <form onSubmit={handleCreateDay}>
                            <div className="form-group">
                                <label className="form-label">Título</label>
                                <input
                                    className="form-input"
                                    value={dayForm.title}
                                    onChange={(e) =>
                                        setDayForm({ ...dayForm, title: e.target.value })
                                    }
                                    placeholder="Ex: A Graça de Deus"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Descrição</label>
                                <textarea
                                    className="form-textarea"
                                    value={dayForm.description}
                                    onChange={(e) =>
                                        setDayForm({ ...dayForm, description: e.target.value })
                                    }
                                    placeholder="Uma breve descrição do dia..."
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateDay(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? "⏳ Criando..." : "🚀 Criar Dia"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Block Modal */}
            {showCreateBlock && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowCreateBlock(false)}
                >
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: blockType ? 560 : 640 }}
                    >
                        {!blockType ? (
                            <>
                                <h2 className="modal-title">🎨 Escolher Tipo de Bloco</h2>
                                <div className="block-type-grid">
                                    {BLOCK_TYPES.map((type) => (
                                        <div
                                            key={type}
                                            className="block-type-option"
                                            onClick={() => setBlockType(type)}
                                        >
                                            <div className="icon">{BLOCK_TYPE_ICONS[type]}</div>
                                            <div className="label">{BLOCK_TYPE_LABELS[type]}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="modal-title">
                                    {BLOCK_TYPE_ICONS[blockType]} {BLOCK_TYPE_LABELS[blockType]}
                                </h2>
                                <BlockContentForm
                                    blockType={blockType}
                                    content={blockContent}
                                    onChange={setBlockContent}
                                />
                                <div className="modal-actions">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setBlockType(null);
                                            setBlockContent({});
                                        }}
                                    >
                                        ← Voltar
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleCreateBlock}
                                        disabled={saving}
                                    >
                                        {saving ? "⏳ Salvando..." : "🚀 Criar Bloco"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Block Modal */}
            {editingBlock && (
                <div
                    className="modal-overlay"
                    onClick={() => setEditingBlock(null)}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">
                            {BLOCK_TYPE_ICONS[editingBlock.block_type as BlockType]}{" "}
                            Editar{" "}
                            {BLOCK_TYPE_LABELS[editingBlock.block_type as BlockType]}
                        </h2>
                        <BlockContentForm
                            blockType={editingBlock.block_type as BlockType}
                            content={editBlockContent}
                            onChange={setEditBlockContent}
                        />
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setEditingBlock(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpdateBlock}
                                disabled={saving}
                            >
                                {saving ? "⏳ Salvando..." : "💾 Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
