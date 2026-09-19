"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";
import { LayoutDashboard, Target, Trophy, Settings, ChevronLeft, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/strategies", label: "Strategies", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const isCollapsed = mounted && collapsed;

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-64"} shrink-0 border-r border-border h-screen sticky top-0 flex flex-col p-4 transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-10 px-2">
        {!isCollapsed && (
          <Link
            href="/dashboard"
            className="text-lg"
            style={{
              fontFamily: "Fraunces, serif",
              fontWeight: 600,
              background: "linear-gradient(135deg, var(--foreground), var(--accent))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Slancialab
          </Link>
        )}
        <button
          onClick={toggle}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center gap-3 text-sm px-3 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-accent-tint text-accent font-semibold"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`flex items-center pt-6 border-t border-border ${isCollapsed ? "flex-col gap-3" : "justify-between"}`}>
        <UserButton />
        <ThemeToggle />
      </div>
    </aside>
  );
}