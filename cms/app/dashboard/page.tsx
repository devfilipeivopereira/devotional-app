"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Stats {
  series: number;
  days: number;
  blocks: number;
  published: number;
}

const BLOCK_TYPES = [
  { icon: "💬", label: "Citação" },
  { icon: "📖", label: "Escritura" },
  { icon: "💭", label: "Reflexão" },
  { icon: "🙏", label: "Oração" },
  { icon: "🌬️", label: "Respiração" },
  { icon: "⚡", label: "Ação" },
  { icon: "📝", label: "Diário" },
  { icon: "🖼️", label: "Imagem" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    series: 0,
    days: 0,
    blocks: 0,
    published: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsPromise = Promise.all([
        supabase.from("devotional_series").select("id", { count: "exact", head: true }),
        supabase.from("devotional_days").select("id", { count: "exact", head: true }),
        supabase.from("devotional_blocks").select("id", { count: "exact", head: true }),
        supabase
          .from("devotional_series")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true),
      ]);

      const [seriesRes, daysRes, blocksRes, publishedRes] = await Promise.race([
        statsPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout ao carregar estatisticas")), 8000)
        ),
      ]);

      setStats({
        series: seriesRes.count || 0,
        days: daysRes.count || 0,
        blocks: blocksRes.count || 0,
        published: publishedRes.count || 0,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
      setError((err as Error).message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Carregando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading" style={{ minHeight: "50vh", gap: 12, flexDirection: "column" }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>❌ Erro no dashboard</div>
        <div style={{ color: "var(--text-muted)", maxWidth: 520, textAlign: "center" }}>{error}</div>
        <button className="btn btn-secondary" onClick={loadStats}>
          🔄 Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Dashboard</h1>
          <p className="page-subtitle">Visão geral do conteúdo devocional</p>
        </div>
      </div>

      <section className="dashboard-hero card">
        <div>
          <p className="eyebrow">✨ Painel</p>
          <h2 className="hero-title">Gestão simples, publicação rápida</h2>
          <p className="hero-text">
            Crie séries, organize dias e publique experiências devocionais com um fluxo limpo e objetivo.
          </p>
        </div>
      </section>

      <div className="stats-grid modern-stats">
        <div className="stat-card kpi-card">
          <div className="kpi-icon">📚</div>
          <div>
            <div className="stat-value">{stats.series}</div>
            <div className="stat-label">Séries</div>
          </div>
        </div>
        <div className="stat-card kpi-card">
          <div className="kpi-icon">✅</div>
          <div>
            <div className="stat-value">{stats.published}</div>
            <div className="stat-label">Publicadas</div>
          </div>
        </div>
        <div className="stat-card kpi-card">
          <div className="kpi-icon">📅</div>
          <div>
            <div className="stat-value">{stats.days}</div>
            <div className="stat-label">Dias</div>
          </div>
        </div>
        <div className="stat-card kpi-card">
          <div className="kpi-icon">🧩</div>
          <div>
            <div className="stat-value">{stats.blocks}</div>
            <div className="stat-label">Blocos</div>
          </div>
        </div>
      </div>

      <section className="card">
        <h3 className="card-title">🎨 Tipos de bloco</h3>
        <p className="page-subtitle" style={{ marginBottom: 16 }}>
          Biblioteca padrão para montar cada sessão devocional.
        </p>
        <div className="feature-grid">
          {BLOCK_TYPES.map((block) => (
            <div key={block.label} className="feature-chip">
              <span className="feature-icon">{block.icon}</span>
              <span>{block.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
