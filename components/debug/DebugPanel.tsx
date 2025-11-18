"use client";

import { useState } from "react";
import { Button } from "@/shared/ui";
import { Bug, X } from "lucide-react";

/**
 * Debug panel component for development
 * Shows useful debugging information
 */
export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const debugInfo = {
    environment: process.env.NODE_ENV,
    nextVersion: "15.2.4",
    reactVersion: "19",
    viewport: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "N/A",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
    theme:
      typeof document !== "undefined"
        ? document.documentElement.classList.contains("dark")
          ? "dark"
          : "light"
        : "N/A",
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg hover:opacity-90"
        aria-label="Abrir painel de debug"
      >
        <Bug className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-border bg-card p-4 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Bug className="h-4 w-4" />
          Debug Panel
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          aria-label="Fechar painel de debug"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium text-muted-foreground">Environment:</div>
          <div className="font-mono">{debugInfo.environment}</div>

          <div className="font-medium text-muted-foreground">Next.js:</div>
          <div className="font-mono">{debugInfo.nextVersion}</div>

          <div className="font-medium text-muted-foreground">React:</div>
          <div className="font-mono">{debugInfo.reactVersion}</div>

          <div className="font-medium text-muted-foreground">Viewport:</div>
          <div className="font-mono">{debugInfo.viewport}</div>

          <div className="font-medium text-muted-foreground">Theme:</div>
          <div className="font-mono">{debugInfo.theme}</div>
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <div className="font-medium text-muted-foreground">User Agent:</div>
          <div className="break-all font-mono text-[10px]">{debugInfo.userAgent}</div>
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("Debug Info:", debugInfo);
              console.log("LocalStorage:", localStorage);
              console.log("SessionStorage:", sessionStorage);
            }}
            className="w-full text-xs"
          >
            Log to Console
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              console.log("Storage cleared");
            }}
            className="w-full text-xs"
          >
            Clear Storage
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              throw new Error("Test error for Sentry");
            }}
            className="w-full text-xs"
          >
            Test Error Boundary
          </Button>
        </div>
      </div>
    </div>
  );
}
