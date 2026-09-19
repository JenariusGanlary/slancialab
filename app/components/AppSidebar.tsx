"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";
import {
  LayoutDashboard,
  FlaskConical,
  Target,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Users,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/creators",
    label: "Creators",
    icon: Users,
  },
  {
    href: "/strategies",
    label: "Strategies",
    icon: Target,
  },
  {
    href: "/experiments",
    label: "Experiments",
    icon: FlaskConical,
  },
  {
    href: "/insights",
    label: "Insights",
    icon: Lightbulb,
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    icon: Trophy,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("sidebar-collapsed");

    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggle = () => {
    const next = !collapsed;

    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const isCollapsed = mounted && collapsed;

  return (
    <aside
      className={`${
        isCollapsed ? "w-[76px]" : "w-[248px]"
      } sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/[0.06] bg-[#090a0f] transition-[width] duration-200`}
    >
      {/* Header */}
      <div
        className={`flex h-[72px] items-center border-b border-white/[0.05] px-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed ? (
          <Link
            href="/dashboard"
            className="group flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-400/[0.08]">
              <Sparkles
                size={15}
                className="text-violet-400"
              />
            </div>

            <span
              className="text-[17px] font-semibold tracking-[-0.02em] text-white"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Slancialab
            </span>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-400/[0.08]"
            title="Slancialab"
          >
            <Sparkles
              size={15}
              className="text-violet-400"
            />
          </Link>
        )}

        <button
          type="button"
          onClick={toggle}
          aria-label={
            isCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className={`flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.07] text-slate-600 transition-all hover:border-white/[0.14] hover:bg-white/[0.03] hover:text-slate-300 ${
            isCollapsed ? "absolute left-[60px]" : ""
          }`}
        >
          {isCollapsed ? (
            <ChevronRight size={13} />
          ) : (
            <ChevronLeft size={13} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col px-3 py-5">
        <div
          className={`mb-3 px-2 text-[9px] font-medium uppercase tracking-[0.16em] text-slate-700 ${
            isCollapsed ? "text-center" : ""
          }`}
        >
          {isCollapsed ? "•••" : "Workspace"}
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-violet-400/[0.09] text-violet-300"
                    : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200"
                } ${
                  isCollapsed
                    ? "justify-center px-0"
                    : ""
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 h-5 w-[2px] rounded-r-full bg-violet-400" />
                )}

                <Icon
                  size={16}
                  strokeWidth={isActive ? 2 : 1.7}
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? "text-violet-400"
                      : "text-slate-600 group-hover:text-slate-300"
                  }`}
                />

                {!isCollapsed && (
                  <span>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Coming next */}
        {!isCollapsed && (
          <div className="mt-auto">
            <div className="mb-3 px-2 text-[9px] font-medium uppercase tracking-[0.16em] text-slate-700">
              Coming next
            </div>

            <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={13}
                  className="text-emerald-400"
                />
                <span className="text-[10px] font-medium text-slate-400">
                  Growth intelligence
                </span>
              </div>

              <p className="mt-2 text-[9px] leading-4 text-slate-700">
                Recommendations based on your experiment history.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="border-t border-white/[0.05] p-3">
        <Link
          href="/settings"
          title={isCollapsed ? "Settings" : undefined}
          className={`mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-white/[0.03] hover:text-slate-200 ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
        >
          <Settings
            size={16}
            strokeWidth={1.7}
            className="text-slate-600"
          />

          {!isCollapsed && <span>Settings</span>}
        </Link>

        <div
          className={`flex items-center border-t border-white/[0.05] pt-3 ${
            isCollapsed
              ? "flex-col gap-3"
              : "justify-between"
          }`}
        >
          <UserButton />

          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}