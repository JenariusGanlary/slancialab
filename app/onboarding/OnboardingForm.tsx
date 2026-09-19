"use client";

import { useState } from "react";

export function OnboardingForm({
  niches,
  stages,
  action,
}: {
  niches: string[];
  stages: string[];
  action: (formData: FormData) => void;
}) {
  const [step, setStep] = useState(0);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [stage, setStage] = useState("");

  const toggleNiche = (n: string) => {
    setSelectedNiches((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  };

  return (
    <div>
      <div className="flex gap-2 mb-10">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ background: i <= step ? "#D9A441" : "rgba(255,255,255,0.12)" }}
          />
        ))}
      </div>

      {step === 0 ? (
        <>
          <h1 className="text-3xl mb-3" style={{ fontFamily: "Fraunces, serif", fontWeight: 600, letterSpacing: "-0.01em" }}>
            What's your niche?
          </h1>
          <p className="text-sm text-[#8B9290] mb-8">
            Pick as many as apply — this decides which strategies and niche leaders show up for you.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-10">
            {niches.map((opt) => {
              const isSelected = selectedNiches.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleNiche(opt)}
                  className="text-left px-5 py-4 rounded-xl text-sm transition-all duration-150 active:scale-[0.97]"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(217,164,65,0.18), rgba(217,164,65,0.05))"
                      : "rgba(255,255,255,0.03)",
                    border: isSelected ? "1px solid rgba(217,164,65,0.5)" : "1px solid rgba(255,255,255,0.1)",
                    color: isSelected ? "#D9A441" : "#ECE7DC",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={selectedNiches.length === 0}
              onClick={() => setStep(1)}
              className="rounded-full px-8 py-3 text-sm font-semibold text-[#14181A] transition-transform active:scale-[0.97] disabled:opacity-40"
              style={{ background: "linear-gradient(180deg, #E9BC63, #C1852E)" }}
            >
              Continue
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl mb-3" style={{ fontFamily: "Fraunces, serif", fontWeight: 600, letterSpacing: "-0.01em" }}>
            Where are you right now?
          </h1>
          <p className="text-sm text-[#8B9290] mb-8">
            Strategies get matched to accounts at a similar stage to yours.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-10">
            {stages.map((opt) => {
              const isSelected = stage === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStage(opt)}
                  className="text-left px-5 py-4 rounded-xl text-sm transition-all duration-150 active:scale-[0.97]"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(217,164,65,0.18), rgba(217,164,65,0.05))"
                      : "rgba(255,255,255,0.03)",
                    border: isSelected ? "1px solid rgba(217,164,65,0.5)" : "1px solid rgba(255,255,255,0.1)",
                    color: isSelected ? "#D9A441" : "#ECE7DC",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center">
            <button type="button" onClick={() => setStep(0)} className="text-sm text-[#8B9290] hover:text-[#ECE7DC] transition-colors">
              Back
            </button>

            <form action={action}>
              {selectedNiches.map((n) => (
                <input key={n} type="hidden" name="niche" value={n} />
              ))}
              <input type="hidden" name="followerStage" value={stage} />
              <button
                type="submit"
                disabled={!stage}
                className="rounded-full px-8 py-3 text-sm font-semibold text-[#14181A] transition-transform active:scale-[0.97] disabled:opacity-40"
                style={{ background: "linear-gradient(180deg, #E9BC63, #C1852E)" }}
              >
                Finish
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}