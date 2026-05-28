"use client";

import { useCallback, useRef, useState } from "react";

type AiStreamRequestData = {
  message: string;
  measurePreference: "grams" | "grams-and-cups";
};

type AiStreamCallbacks = {
  onFinish?: (content: string) => void;
};

type AiStreamState = {
  streamedContent: string;
  isStreaming: boolean;
  error: string | null;
};

type UseAiStreamReturn = AiStreamState & {
  sendMessage: (recipeId: string, data: AiStreamRequestData, callbacks?: AiStreamCallbacks) => void;
  reset: () => void;
};

const INITIAL_STATE: AiStreamState = {
  streamedContent: "",
  isStreaming: false,
  error: null,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function extractStreamToken(payload: unknown): string | null {
  if (typeof payload === "string") return payload;

  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const directToken = record.t ?? record.text ?? record.content ?? record.delta;

  if (typeof directToken === "string") return directToken;

  const choices = record.choices;
  if (Array.isArray(choices)) {
    const firstChoice = choices[0] as Record<string, unknown> | undefined;
    const delta = firstChoice?.delta as Record<string, unknown> | undefined;
    const content = delta?.content ?? firstChoice?.text;

    if (typeof content === "string") return content;
  }

  return null;
}

export function useAiStream(): UseAiStreamReturn {
  const [state, setState] = useState<AiStreamState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback((): void => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  const sendMessage = useCallback(
    (recipeId: string, data: AiStreamRequestData, callbacks?: AiStreamCallbacks): void => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState({
        streamedContent: "",
        isStreaming: true,
        error: null,
      });

      startStream(recipeId, data, controller.signal, setState, callbacks).catch(() => {
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
  callbacks?: AiStreamCallbacks,
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
    let streamedContent = "";

    const appendToken = (token: string) => {
      streamedContent += token;
      setState((prev) => ({
        ...prev,
        streamedContent: prev.streamedContent + token,
      }));
    };

    const finish = () => {
      setState((prev) => ({ ...prev, isStreaming: false }));
      callbacks?.onFinish?.(streamedContent);
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const rawLine of lines) {
        if (rawLine.trim().length === 0) continue;

        if (rawLine.startsWith("event: done")) {
          finish();
          return;
        }

        if (rawLine.startsWith("event: error")) {
          continue;
        }

        if (rawLine.startsWith("data:")) {
          const payload = rawLine.slice(5).replace(/^ /, "");

          if (payload === "[DONE]") {
            finish();
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
                const token = extractStreamToken(parsed);
                if (token !== null) {
                  appendToken(token);
                  continue;
                }

                continue;
              }
            } catch {
              /* Not JSON — treat as text token */
            }
          }

          appendToken(payload);
        }
      }
    }

    finish();
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
