"use client";

import { useState } from "react";

export function SettingsForm({
  niches,
  stages,
  currentNiche,
  currentStage,
  action,
}: {
  niches: string[];
  stages: string[];
  currentNiche: string[];
  currentStage: string;
  action: (formData: FormData) => void;
}) {
  const [selectedNiches, setSelectedNiches] = useState<string[]>(currentNiche);
  const [stage, setStage] = useState(currentStage);

  const toggleNiche = (n: string) => {
    setSelectedNiches((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  };

  return (
    <form action={action}>
      <div className="mb-10">
        <h2 className="text-sm text-muted-foreground mb-4">Your niche</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {niches.map((opt) => {
            const isSelected = selectedNiches.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleNiche(opt)}
                className="text-left px-5 py-4 rounded-xl text-sm transition-all duration-150 active:scale-[0.97] border"
                style={{
                  background: isSelected ? "var(--accent-tint)" : "var(--surface)",
                  borderColor: isSelected ? "var(--accent)" : "var(--border)",
                  color: isSelected ? "var(--accent)" : "var(--foreground)",
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-sm text-muted-foreground mb-4">Follower stage</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stages.map((opt) => {
            const isSelected = stage === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setStage(opt)}
                className="text-left px-5 py-4 rounded-xl text-sm transition-all duration-150 active:scale-[0.97] border"
                style={{
                  background: isSelected ? "var(--accent-tint)" : "var(--surface)",
                  borderColor: isSelected ? "var(--accent)" : "var(--border)",
                  color: isSelected ? "var(--accent)" : "var(--foreground)",
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {selectedNiches.map((n) => (
        <input key={n} type="hidden" name="niche" value={n} />
      ))}
      <input type="hidden" name="followerStage" value={stage} />

      <button
        type="submit"
        disabled={selectedNiches.length === 0 || !stage}
        className="rounded-full px-8 py-3 text-sm font-semibold bg-accent text-accent-foreground transition-transform active:scale-[0.97] disabled:opacity-40"
      >
        Save changes
      </button>
    </form>
  );
}