"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Stats {
    series: number;
    days: number;
    blocks: number;
    published: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        series: 0,
        days: 0,
        blocks: 0,
        published: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [seriesRes, daysRes, blocksRes, publishedRes] = await Promise.all([
                supabase
                    .from("devotional_series")
                    .select("id", { count: "exact", head: true }),
                supabase
                    .from("devotional_days")
                    .select("id", { count: "exact", head: true }),
                supabase
                    .from("devotional_blocks")
                    .select("id", { count: "exact", head: true }),
                supabase
                    .from("devotional_series")
                    .select("id", { count: "exact", head: true })
                    .eq("is_published", true),
            ]);

            setStats({
                series: seriesRes.count || 0,
                days: daysRes.count || 0,
                blocks: blocksRes.count || 0,
                published: publishedRes.count || 0,
            });
        } catch (err) {
            console.error("Error loading stats:", err);
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

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">
                        Visão geral do conteúdo devocional
                    </p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.series}</div>
                    <div className="stat-label">Séries</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.published}</div>
                    <div className="stat-label">Publicadas</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.days}</div>
                    <div className="stat-label">Dias</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.blocks}</div>
                    <div className="stat-label">Blocos</div>
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">🚀 Bem-vindo ao CMS</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                    Use o menu lateral para gerenciar suas séries devocionais. Cada série
                    contém dias, e cada dia contém blocos de conteúdo que os usuários
                    irão percorrer na sessão devocional.
                </p>
                <div style={{ marginTop: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                        Tipos de Blocos Disponíveis:
                    </h4>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 8,
                        }}
                    >
                        {[
                            { icon: "💬", label: "Citação" },
                            { icon: "📖", label: "Escritura" },
                            { icon: "💭", label: "Reflexão" },
                            { icon: "🙏", label: "Oração" },
                            { icon: "🌬️", label: "Respiração" },
                            { icon: "⚡", label: "Ação" },
                            { icon: "📝", label: "Diário" },
                            { icon: "🖼️", label: "Meditação" },
                        ].map((block) => (
                            <div
                                key={block.label}
                                style={{
                                    background: "var(--coral-light)",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    textAlign: "center",
                                    fontSize: 12,
                                    fontWeight: 600,
                                }}
                            >
                                <span style={{ fontSize: 20 }}>{block.icon}</span>
                                <br />
                                {block.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
