import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function AppHeader() {
  return (
    <div className="border-b border-white/[0.07]">
      <header className="flex justify-between items-center px-6 md:px-12 py-6 max-w-6xl mx-auto">
        <Link
          href="/dashboard"
          className="text-lg"
          style={{
            fontFamily: "Fraunces, serif",
            fontWeight: 600,
            background: "linear-gradient(135deg, #F4F0E6, #C9A465)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Slancialab
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="text-sm text-[#8B9290] hover:text-[#ECE7DC] transition-colors hidden sm:inline">
            Dashboard
          </Link>
          <Link href="/strategies" className="text-sm text-[#8B9290] hover:text-[#ECE7DC] transition-colors hidden sm:inline">
            Strategies
          </Link>
          <Link href="/leaderboard" className="text-sm text-[#8B9290] hover:text-[#ECE7DC] transition-colors hidden sm:inline">
            Leaderboard
          </Link>
          <Link href="/settings" className="text-sm text-[#8B9290] hover:text-[#ECE7DC] transition-colors">
            Settings
          </Link>
          <UserButton />
        </nav>
      </header>
    </div>
  );
}