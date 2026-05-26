"use client";

import { useCallback, useRef, useState } from "react";

type AiStreamRequestData = {
  message: string;
  measurePreference: string;
};

type AiStreamState = {
  streamedContent: string;
  isStreaming: boolean;
  error: string | null;
};

type UseAiStreamReturn = AiStreamState & {
  sendMessage: (recipeId: string, data: AiStreamRequestData) => void;
  reset: () => void;
};

const INITIAL_STATE: AiStreamState = {
  streamedContent: "",
  isStreaming: false,
  error: null,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function useAiStream(): UseAiStreamReturn {
  const [state, setState] = useState<AiStreamState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback((): void => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  const sendMessage = useCallback(
    (recipeId: string, data: AiStreamRequestData): void => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState({
        streamedContent: "",
        isStreaming: true,
        error: null,
      });

      startStream(recipeId, data, controller.signal, setState).catch(() => {
        /* errors handled inside startStream */
      });
    },
    [],
  );

  return { ...state, sendMessage, reset };
}

async function startStream(
  recipeId: string,
  data: AiStreamRequestData,
  signal: AbortSignal,
  setState: React.Dispatch<React.SetStateAction<AiStreamState>>,
): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/ai/recipes/${recipeId}/assistant/stream`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
        signal,
      },
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      const errorMessage =
        response.status === 401
          ? "Sessão expirada. Faça login novamente."
          : `Erro ao conectar com o assistente (${response.status})`;

      setState((prev) => ({
        ...prev,
        isStreaming: false,
        error: errorBody || errorMessage,
      }));
      return;
    }

    if (!response.body) {
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        error: "Resposta sem conteúdo do servidor",
      }));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const rawLine of lines) {
        if (rawLine.trim().length === 0) continue;

        if (rawLine.startsWith("event: done")) {
          setState((prev) => ({ ...prev, isStreaming: false }));
          return;
        }

        if (rawLine.startsWith("event: error")) {
          continue;
        }

        if (rawLine.startsWith("data:")) {
          const payload = rawLine.slice(5).replace(/^ /, "");

          if (payload === "[DONE]") {
            setState((prev) => ({ ...prev, isStreaming: false }));
            return;
          }

          if (payload.startsWith("{")) {
            try {
              const parsed: unknown = JSON.parse(payload);
              if (
                typeof parsed === "object" &&
                parsed !== null
              ) {
                if ("error" in parsed) {
                  setState((prev) => ({
                    ...prev,
                    isStreaming: false,
                    error: (parsed as { error: string }).error,
                  }));
                  return;
                }
                if ("t" in parsed) {
                  setState((prev) => ({
                    ...prev,
                    streamedContent: prev.streamedContent + (parsed as { t: string }).t,
                  }));
                  continue;
                }
              }
            } catch {
              /* Not JSON — treat as text token */
            }
          }

          setState((prev) => ({
            ...prev,
            streamedContent: prev.streamedContent + payload,
          }));
        }
      }
    }

    setState((prev) => ({ ...prev, isStreaming: false }));
  } catch (error) {
    if (signal.aborted) return;

    const message =
      error instanceof Error
        ? error.message
        : "Erro inesperado no streaming";

    setState((prev) => ({
      ...prev,
      isStreaming: false,
      error: message,
    }));
  }
}
