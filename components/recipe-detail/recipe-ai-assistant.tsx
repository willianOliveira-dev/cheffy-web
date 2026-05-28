"use client";

import type { KeyboardEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import { Maximize2, Send, User } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Streamdown } from "streamdown";
import type { Recipe } from "@/api/generated/model";
import { authClient } from "@/lib/auth-client";
import { useAiStream } from "@/lib/hooks/use-ai-stream";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type RecipeAiAssistantProps = {
  recipe: Recipe;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type MeasurePreference = "grams" | "grams-and-cups";

type AiChatFormValues = {
  message: string;
  measurePreference: MeasurePreference;
};

const suggestedQuestions = [
  "Posso substituir algum ingrediente?",
  "Como adaptar para mais porções?",
  "Me dê uma versão mais leve dessa receita.",
];

function BotAvatar() {
  return (
    <Image
      src="/images/bot.svg"
      alt="Assistente Cheffy"
      width={20}
      height={23}
      className="h-5 w-auto"
    />
  );
}

export function RecipeAiAssistant({ recipe }: RecipeAiAssistantProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const isMobileViewport = useMediaQuery("(max-width: 767px)");
  const { data: session } = authClient.useSession();
  const form = useForm<AiChatFormValues>({
    defaultValues: {
      message: "",
      measurePreference: "grams",
    },
  });
  const message = useWatch({ control: form.control, name: "message" }) || "";
  const measurePreference =
    useWatch({ control: form.control, name: "measurePreference" }) || "grams";
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
    form.setValue("message", "", { shouldValidate: false });

    sendAiStream(
      recipe.id,
      {
        message: trimmed,
        measurePreference,
      },
      {
        onFinish: (answer) => {
          if (!answer) return;

          setMessages((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: answer,
            },
          ]);
        },
      },
    );
  };

  const handleSubmit = form.handleSubmit((values) => {
    sendMessage(values.message);
  });

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    sendMessage(form.getValues("message"));
  };

  const renderConversation = (isFullscreen = false) => (
    <ScrollArea
      className={cn(
        "min-w-0 rounded-xl bg-muted/30",
        isFullscreen ? "min-h-0 flex-1 rounded-none border-y" : "h-[28rem]",
      )}
    >
      <div className="flex min-w-0 max-w-full flex-col gap-3 overflow-hidden p-3">
        {messages.map((item) => {
          const isUser = item.role === "user";

          return (
            <div
              key={item.id}
              className={cn(
                "flex w-full min-w-0 items-start gap-3",
                isUser ? "justify-end" : "justify-start",
              )}
            >
              {!isUser && (
                <div className="mt-1 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-background shadow-sm">
                  <BotAvatar />
                </div>
              )}

              <div
                className={cn(
                  "min-w-0 max-w-[calc(100%_-_2.75rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[78%]",
                  isUser
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border border-border/70 bg-background text-foreground",
                )}
              >
                <div
                  className={cn(
                    "w-full min-w-0 overflow-x-auto break-words [overflow-wrap:anywhere]",
                    isUser
                      ? "whitespace-pre-wrap"
                      : "prose prose-sm max-w-none dark:prose-invert [&_*:first-child]:mt-0 [&_*:last-child]:mb-0",
                  )}
                >
                  {isUser ? item.content : <Streamdown>{item.content}</Streamdown>}
                </div>
              </div>

              {isUser && (
                <div className="mt-1 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Avatar do usuário"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isStreaming && (
          <div className="flex w-full min-w-0 items-start justify-start gap-3">
            <div className="mt-1 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-background shadow-sm">
              <BotAvatar />
            </div>
            <div className="min-w-0 max-w-[calc(100%_-_2.75rem)] rounded-2xl rounded-bl-md border border-border/70 bg-background px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm sm:max-w-[78%]">
              <div className="prose prose-sm max-w-none animate-pulse overflow-x-auto break-words [overflow-wrap:anywhere] dark:prose-invert [&_*:first-child]:mt-0 [&_*:last-child]:mb-0">
                {streamedContent ? (
                  <Streamdown animated isAnimating={isStreaming}>
                    {streamedContent}
                  </Streamdown>
                ) : (
                  <p className="text-muted-foreground">Preparando uma resposta...</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );

  const renderSuggestions = (isFullscreen = false) => (
    <div
      className={cn(
        "flex gap-2",
        isFullscreen ? "shrink-0 flex-wrap px-3" : "flex-wrap",
      )}
    >
      {suggestedQuestions.map((question) => (
        <Button
          key={question}
          type="button"
          size="sm"
          variant="outline"
          className={cn(
            "rounded-full",
            isFullscreen && "h-auto min-h-9 min-w-0 max-w-full whitespace-normal text-left",
          )}
          onClick={() => sendMessage(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  );

  const renderComposer = (isFullscreen = false) => (
    <form
      onSubmit={handleSubmit}
      className={cn(isFullscreen && "w-full min-w-0 shrink-0 border-t bg-background p-3")}
    >
      <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-colors focus-within:border-primary/70 focus-within:ring-4 focus-within:ring-primary/10">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Pergunte sobre substituições, medidas, tempo de preparo ou variações..."
                  className={cn(
                    "resize-none border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                    isFullscreen ? "min-h-24" : "min-h-28",
                  )}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div
          className={cn(
            "flex gap-2 border-t bg-muted/25 px-3 py-3",
            isFullscreen ? "flex-row items-center justify-between" : "flex-col sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <FormField
            control={form.control}
            name="measurePreference"
            render={({ field }) => (
              <FormItem>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value === "grams" || value === "grams-and-cups") {
                      field.onChange(value);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        "h-9 rounded-full border-border/70 bg-background px-3 text-xs shadow-none",
                        isFullscreen ? "w-[9.5rem]" : "w-full sm:w-[180px]",
                      )}
                    >
                      <SelectValue placeholder="Medidas" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="grams">Apenas Gramas</SelectItem>
                    <SelectItem value="grams-and-cups">Gramas e Xícaras</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="sm"
            className={cn("h-9 shrink-0 rounded-full px-4", !isFullscreen && "self-end sm:self-auto")}
            disabled={message.trim().length < 3 || isStreaming}
          >
            <Send data-icon="inline-start" />
            {isStreaming ? "Respondendo" : isFullscreen ? "Enviar" : "Enviar pergunta"}
          </Button>
        </div>
      </div>
    </form>
  );

  const renderAssistantContent = (isFullscreen = false) => (
    <div className={cn("flex min-w-0 flex-col gap-4", isFullscreen && "min-h-0 flex-1 overflow-hidden py-3")}>
      {renderConversation(isFullscreen)}

      {streamError && (
        <div className={cn(isFullscreen && "shrink-0 px-4")}>
          <Alert variant="destructive">
            <AlertTitle>Erro ao consultar o assistente</AlertTitle>
            <AlertDescription>
              {streamError || "Tente novamente em alguns instantes."}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {renderSuggestions(isFullscreen)}
      {renderComposer(isFullscreen)}
    </div>
  );

  return (
    <Form {...form}>
      <section id="assistente" className="flex flex-col gap-5">
        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight">Assistente da receita</h2>
          <p className="mt-2 text-muted-foreground">
            Converse com a IA ao final da receita para tirar dúvidas, ajustar porções e adaptar ingredientes.
          </p>
        </div>

        <Dialog open={isMobileChatOpen} onOpenChange={setIsMobileChatOpen}>
          {isMobileViewport ? (
            <Card className="md:hidden">
              <CardContent className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-background">
                    <BotAvatar />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">Chat da receita</p>
                    <p className="text-sm text-muted-foreground">
                      Abra em tela cheia para conversar com mais espaço.
                    </p>
                  </div>
                </div>
                <DialogTrigger asChild>
                  <Button type="button" className="w-full rounded-full">
                    <Maximize2 data-icon="inline-start" />
                    Ver chat em tela cheia
                  </Button>
                </DialogTrigger>
              </CardContent>
            </Card>
          ) : (
            <Card className="hidden md:block">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Image
                    src="/images/cheffy-ai.svg"
                    alt="Cheffy AI"
                    width={120}
                    height={32}
                    className="h-8 w-auto"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {renderAssistantContent()}
              </CardContent>
            </Card>
          )}

          <DialogContent
            showCloseButton
            className="inset-0 left-0 top-0 flex h-[100svh] max-h-[100svh] w-[100dvw] max-w-[100dvw] translate-x-0 translate-y-0 overflow-hidden rounded-none p-0 ring-0 sm:max-w-[100dvw] md:hidden"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>Assistente da receita</DialogTitle>
              <DialogDescription>
                Chat em tela cheia para conversar com o assistente Cheffy sobre esta receita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex h-[100svh] w-[100dvw] min-w-0 max-w-[100dvw] flex-col overflow-hidden bg-background">
              <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3 pr-12">
                <Image
                  src="/images/cheffy-ai.svg"
                  alt="Cheffy AI"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                />
              </div>
              {renderAssistantContent(true)}
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <AuthDialog
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        title="Entre para conversar com a IA"
        description="Faça login com sua conta Google para usar o assistente da receita e receber respostas personalizadas."
      />
    </Form>
  );
}
