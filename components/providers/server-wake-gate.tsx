"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { getHealth } from "@/api/generated/health/health";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const TIMEOUT_MS = 5_000;
const RETRY_INTERVAL_MS = 3_000;
const MAX_DURATION_MS = 60_000;

type GateStatus = "loading" | "online" | "failed";

type ServerWakeGateProps = {
  children: ReactNode;
};

export function ServerWakeGate({ children }: ServerWakeGateProps): ReactNode {
  const [status, setStatus] = useState<GateStatus>("loading");
  const [retryKey, setRetryKey] = useState(0);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    const startedAt = Date.now();
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function ping(): Promise<void> {
      try {
        await getHealth({ timeout: TIMEOUT_MS });
        if (activeRef.current) setStatus("online");
      } catch {
        if (!activeRef.current) return;

        const elapsed = Date.now() - startedAt;

        if (elapsed >= MAX_DURATION_MS) {
          setStatus("failed");
          return;
        }

        timer = setTimeout(() => {
          if (activeRef.current) void ping();
        }, RETRY_INTERVAL_MS);
      }
    }

    void ping();

    return () => {
      activeRef.current = false;
      if (timer) clearTimeout(timer);
    };
  }, [retryKey]);

  const handleRetry = useCallback((): void => {
    setStatus("loading");
    setRetryKey((k) => k + 1);
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
          className={`h-20 w-auto transition-all duration-700 ${status === "failed" ? "opacity-30 grayscale" : "animate-pulse"
            }`}
        />

        {status === "failed" && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm text-muted-foreground">
              Não foi possível conectar ao servidor.
            </p>
            <Button variant="outline" className="rounded-full px-6" onClick={handleRetry}>
              Tentar novamente
            </Button>
          </div>
        )}

      </div>
    </main>
  );
}
