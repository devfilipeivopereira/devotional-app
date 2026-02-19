"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { DevotionalSeries } from "@/lib/types";

export default function SeriesListPage() {
    const [series, setSeries] = useState<DevotionalSeries[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ title: "", description: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSeries();
    }, []);

    const loadSeries = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("devotional_series")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) setSeries(data);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase
            .from("devotional_series")
            .insert({ title: form.title, description: form.description || null });

        if (!error) {
            setForm({ title: "", description: "" });
            setShowCreate(false);
            loadSeries();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta série?")) return;
        await supabase.from("devotional_series").delete().eq("id", id);
        loadSeries();
    };

    const togglePublish = async (id: string, current: boolean) => {
        await supabase
            .from("devotional_series")
            .update({ is_published: !current })
            .eq("id", id);
        loadSeries();
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner" />
                Carregando séries...
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Séries</h1>
                    <p className="page-subtitle">
                        {series.length} série{series.length !== 1 ? "s" : ""} • Gerencie o
                        conteúdo devocional
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreate(true)}
                >
                    + Nova Série
                </button>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Nova Série</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Título</label>
                                <input
                                    className="form-input"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({ ...form, title: e.target.value })
                                    }
                                    placeholder="Ex: Encontro Diário"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Descrição</label>
                                <textarea
                                    className="form-textarea"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    placeholder="Uma breve descrição da série..."
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreate(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? "Salvando..." : "Criar Série"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Series Grid */}
            {series.length === 0 ? (
                <div className="card empty-state">
                    <div className="icon">📚</div>
                    <h3>Nenhuma série ainda</h3>
                    <p>Crie sua primeira série devocional para começar.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreate(true)}
                    >
                        + Nova Série
                    </button>
                </div>
            ) : (
                <div className="card-grid">
                    {series.map((s) => (
                        <div key={s.id} className="card">
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                }}
                            >
                                <h3 className="card-title">{s.title}</h3>
                                <span
                                    className={`badge ${s.is_published ? "badge-published" : "badge-draft"
                                        }`}
                                >
                                    {s.is_published ? "Publicada" : "Rascunho"}
                                </span>
                            </div>
                            {s.description && (
                                <p
                                    className="card-meta"
                                    style={{ marginBottom: 12, display: "block" }}
                                >
                                    {s.description}
                                </p>
                            )}
                            <div className="card-meta">
                                Criada em{" "}
                                {new Date(s.created_at).toLocaleDateString("pt-BR")}
                            </div>
                            <div className="card-actions">
                                <Link
                                    href={`/dashboard/series/${s.id}`}
                                    className="btn btn-primary btn-sm"
                                >
                                    Editar
                                </Link>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => togglePublish(s.id, s.is_published)}
                                >
                                    {s.is_published ? "Despublicar" : "Publicar"}
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(s.id)}
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
