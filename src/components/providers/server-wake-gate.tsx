"use client";

import { type ReactNode, useEffect, useState } from "react";
import { FallbackImage as Image } from "@/components/shared/fallback-image";
import { getHealth } from "@/services/api/generated/health/health";

const TIMEOUT_MS = 5_000;
const RETRY_INTERVAL_MS = 3_000;

type GateStatus = "loading" | "online";

type ServerWakeGateProps = {
  children: ReactNode;
};

export function ServerWakeGate({ children }: ServerWakeGateProps): ReactNode {
  const [status, setStatus] = useState<GateStatus>("loading");

  useEffect(() => {
    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function ping(): Promise<void> {
      try {
        await getHealth({ timeout: TIMEOUT_MS });
        if (!isCancelled) setStatus("online");
      } catch {
        if (isCancelled) return;

        timer = setTimeout(() => {
          if (!isCancelled) void ping();
        }, RETRY_INTERVAL_MS);
      }
    }

    void ping();

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (status === "online") return children;

  return (
    <main className="fixed inset-0 z-100 flex min-h-svh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-1000 ease-out">
        <Image
          src="/images/logo.svg"
          alt="Cheffy"
          width={96}
          height={96}
          priority
          className="h-20 w-auto animate-pulse"
        />

        <div
          role="status"
          aria-live="polite"
          className="max-w-sm space-y-2 px-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <p className="font-medium text-foreground">Estamos preparando o Cheffy para você</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A primeira abertura pode levar até 5 minutos. Esta página continuará tentando
            automaticamente.
          </p>
        </div>
      </div>
    </main>
  );
}
