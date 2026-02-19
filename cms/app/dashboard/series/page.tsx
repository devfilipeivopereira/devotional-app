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
    if (!confirm("Tem certeza que deseja excluir esta serie?")) return;
    await supabase.from("devotional_series").delete().eq("id", id);
    loadSeries();
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("devotional_series").update({ is_published: !current }).eq("id", id);
    loadSeries();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Carregando series...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Series</h1>
          <p className="page-subtitle">
            {series.length} serie{series.length !== 1 ? "s" : ""} • gerencie e publique conteudo
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Nova serie
        </button>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Nova serie</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Titulo</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Encontro Diario"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descricao</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Uma descricao curta da serie"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Salvando..." : "Criar serie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {series.length === 0 ? (
        <div className="card empty-state">
          <div className="icon">SR</div>
          <h3>Nenhuma serie ainda</h3>
          <p>Crie sua primeira serie devocional para comecar.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Nova serie
          </button>
        </div>
      ) : (
        <div className="card-grid modern-series-grid">
          {series.map((s) => (
            <article key={s.id} className="card series-card">
              <div className="series-card-head">
                <div>
                  <p className="eyebrow">Serie</p>
                  <h3 className="card-title">{s.title}</h3>
                </div>
                <span className={`badge ${s.is_published ? "badge-published" : "badge-draft"}`}>
                  {s.is_published ? "Publicada" : "Rascunho"}
                </span>
              </div>

              <p className="series-description">{s.description || "Sem descricao."}</p>

              <div className="series-meta">
                Criada em {new Date(s.created_at).toLocaleDateString("pt-BR")}
              </div>

              <div className="card-actions series-actions">
                <Link href={`/dashboard/series/${s.id}`} className="btn btn-primary btn-sm">
                  Editar
                </Link>
                <button className="btn btn-secondary btn-sm" onClick={() => togglePublish(s.id, s.is_published)}>
                  {s.is_published ? "Despublicar" : "Publicar"}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
