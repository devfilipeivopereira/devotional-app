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

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push("/");
                return;
            }
            setUser(session.user);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push("/");
                return;
            }
            setUser(session.user);
        });

        return () => subscription.unsubscribe();
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

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    🕊️ Devocional
                    <span>CMS Admin</span>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${pathname === item.href || pathname.startsWith(item.href + "/")
                                    ? "active"
                                    : ""
                                }`}
                        >
                            <span className="icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="avatar">
                            {user?.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                                Admin
                            </div>
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
                        style={{ width: "100%", marginTop: 8, justifyContent: "center" }}
                    >
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="main-content">{children}</main>
        </div>
    );
}
