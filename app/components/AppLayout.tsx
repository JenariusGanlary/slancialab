import { AppSidebar } from "./AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <AppSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}