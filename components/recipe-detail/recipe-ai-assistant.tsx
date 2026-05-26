"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import type { Recipe } from "@/api/generated/model";
import { AskRecipeAssistantBodyMeasurePreference } from "@/api/generated/model";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAiStream } from "@/lib/hooks/use-ai-stream";
import { Streamdown } from "streamdown";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RecipeAiAssistantProps = {
  recipe: Recipe;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const suggestedQuestions = [
  "Posso substituir algum ingrediente?",
  "Como adaptar para mais porções?",
  "Me dê uma versão mais leve dessa receita.",
];

export function RecipeAiAssistant({ recipe }: RecipeAiAssistantProps) {
  const [message, setMessage] = useState("");
  const [measurePreference, setMeasurePreference] = useState<"grams" | "grams-and-cups">("grams");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content: `Olá! Posso te ajudar com dúvidas sobre a receita "${recipe.title}", substituições, medidas e variações.`,
    },
  ]);

  const {
    streamedContent,
    isStreaming,
    error: streamError,
    sendMessage: sendAiStream,
  } = useAiStream();

  const wasStreaming = useRef(isStreaming);

  useEffect(() => {
    if (wasStreaming.current && !isStreaming) {
      if (streamedContent) {
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: streamedContent,
          },
        ]);
      }
    }
    wasStreaming.current = isStreaming;
  }, [isStreaming, streamedContent]);

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (trimmed.length < 3 || isStreaming) return;

    if (!session) {
      setIsAuthOpen(true);
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      },
    ]);
    setMessage("");

    sendAiStream(recipe.id, {
      message: trimmed,
      measurePreference,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(message);
  };

  return (
    <>
      <section id="assistente" className="flex flex-col gap-5">
        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight">Assistente da receita</h2>
          <p className="mt-2 text-muted-foreground">
            Converse com a IA ao final da receita para tirar dúvidas, ajustar porções e adaptar ingredientes.
          </p>
        </div>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              IA Cheffy
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">
            <div className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto rounded-xl bg-muted/30 p-3">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex gap-3 rounded-xl p-3",
                    item.role === "user"
                      ? "ml-auto max-w-[85%] bg-primary text-primary-foreground"
                      : "mr-auto max-w-[90%] bg-background",
                  )}
                >
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground overflow-hidden">
                    {item.role === "user" ? (
                      session?.user?.image ? (
                        <img src={session.user.image} alt="User avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4" />
                      )
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className={cn("text-sm leading-relaxed overflow-x-auto w-full", item.role === "assistant" ? "prose prose-sm dark:prose-invert max-w-none" : "whitespace-pre-wrap")}>
                    {item.role === "user" ? (
                      item.content
                    ) : (
                      <Streamdown>{item.content}</Streamdown>
                    )}
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="mr-auto flex max-w-[90%] gap-3 rounded-xl bg-background p-3 w-full">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-foreground overflow-x-auto w-full prose prose-sm dark:prose-invert max-w-none">
                    <Streamdown animated isAnimating={isStreaming}>
                      {streamedContent || ""}
                    </Streamdown>
                    {!streamedContent && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Pensando na melhor resposta...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {streamError && (
              <Alert variant="destructive">
                <AlertTitle>Erro ao consultar o assistente</AlertTitle>
                <AlertDescription>
                  {streamError || "Tente novamente em alguns instantes."}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <Button
                  key={question}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => sendMessage(question)}
                >
                  {question}
                </Button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Select value={measurePreference} onValueChange={(val: any) => setMeasurePreference(val)}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue placeholder="Medidas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grams">Apenas Gramas</SelectItem>
                    <SelectItem value="grams-and-cups">Gramas e Xícaras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Pergunte sobre substituições, medidas, tempo de preparo ou variações..."
                className="min-h-24"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={message.trim().length < 3 || isStreaming}>
                  {isStreaming ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <Send data-icon="inline-start" />
                  )}
                  Enviar pergunta
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <AuthDialog
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        title="Entre para conversar com a IA"
        description="Faça login com sua conta Google para usar o assistente da receita e receber respostas personalizadas."
      />
    </>
  );
}

