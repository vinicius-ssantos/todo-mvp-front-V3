import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/debug/ErrorBoundary";
import { DebugPanel } from "@/components/debug/DebugPanel";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TodoList App",
  description: "Gerenciador de tarefas moderno e eficiente",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <Providers>{children}</Providers>
          <Analytics />
          <DebugPanel />
        </ErrorBoundary>
      </body>
    </html>
  );
}
