"use client";

import { PawPrint } from "lucide-react";

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-4">
          <PawPrint className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">TeteCare Hub</span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  );
}
