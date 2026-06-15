"use client";

import { type ReactNode, useEffect, useState } from "react";
import { FallbackImage as Image } from "@/components/shared/fallback-image";
import { FlipWords } from "@/components/ui/flip-words";
import { getHealth } from "@/services/api/generated/health/health";

const TIMEOUT_MS = 5_000;
const RETRY_INTERVAL_MS = 3_000;
const MESSAGE_DELAY_MS = 60_000;
const MESSAGE_DURATION_MS = 5_000;

const SERVER_WAKE_MESSAGES = [
  "Estamos preparando o Cheffy para você.",
  "A primeira abertura pode levar até 5 minutos.",
  "É normal demorar um pouco.",
  "Só mais um momento enquanto preparamos o Cheffy para você.",
  "A cozinha está sendo preparada.",
];

type GateStatus = "loading" | "online";

type ServerWakeGateProps = {
  children: ReactNode;
};

export function ServerWakeGate({ children }: ServerWakeGateProps): ReactNode {
  const [status, setStatus] = useState<GateStatus>("loading");
  const [showMessage, setShowMessage] = useState(false);

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

  useEffect(() => {
    if (status === "online") return;

    const timer = setTimeout(() => setShowMessage(true), MESSAGE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [status]);

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

        {showMessage && (
          <div
            role="status"
            aria-live="polite"
            className="max-w-xl px-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <FlipWords
              words={SERVER_WAKE_MESSAGES}
              duration={MESSAGE_DURATION_MS}
              className="text-muted-foreground font-medium sm:text-lg"
            />
          </div>
        )}
      </div>
    </main>
  );
}
