"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/series", label: "Séries", icon: "📚" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout ao obter sessao")), 8000)
          ),
        ]);
        const session = sessionResult.data.session;
        if (!session) {
          router.push("/");
          return;
        }
        if (cancelled) return;
        setUser(session.user);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setFatalError((err as Error).message || "Erro ao carregar sessao");
        setLoading(false);
      }
    };
    boot();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        router.push("/");
        return;
      }
      if (cancelled) return;
      setUser(session.user);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: "100vh" }}>
        <div className="spinner" />
        Carregando...
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="loading" style={{ minHeight: "100vh", gap: 12, flexDirection: "column" }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>❌ Erro ao carregar o CMS</div>
        <div style={{ color: "var(--text-muted)", maxWidth: 520, textAlign: "center" }}>
          {fatalError}
        </div>
        <button className="btn btn-secondary" onClick={() => window.location.reload()}>
          🔄 Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🕊️</div>
          <div>
            Devocional
            <span>CMS Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href || pathname.startsWith(item.href + "/") ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{user?.email?.charAt(0).toUpperCase() || "U"}</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>👤 Admin</div>
              <div
                style={{
                  fontSize: 11,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ width: "100%", marginTop: 8, justifyContent: "center", color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
