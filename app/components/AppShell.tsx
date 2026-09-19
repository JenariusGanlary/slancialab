export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background:
          "radial-gradient(1000px circle at 92% 0%, rgba(217,164,65,0.11), transparent 60%), radial-gradient(600px circle at 0% 100%, rgba(15,110,106,0.05), transparent 60%), linear-gradient(160deg, #16191B 0%, #0C0F11 100%)",
        color: "#ECE7DC",
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden" }}>
        <filter id="appGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.025 0" />
        </filter>
      </svg>
      {children}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ filter: "url(#appGrain)", mixBlendMode: "overlay", opacity: 0.12 }}
      />
    </div>
  );
}