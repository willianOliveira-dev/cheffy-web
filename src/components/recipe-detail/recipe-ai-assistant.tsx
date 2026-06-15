"use client";

import type { KeyboardEvent } from "react";
import { useState } from "react";
import { FallbackImage as Image } from "@/components/shared/fallback-image";
import { Maximize2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import type { Recipe } from "@/services/api/generated/model";
import { authClient } from "@/services/auth/client";
import { useAiStream } from "@/hooks/use-ai-stream";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/utils/class-names";
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
import { Form } from "@/components/ui/form";
import { ChatMessages, type ChatMessage, BotAvatar } from "./chat-messages";
import { ChatSuggestions } from "./chat-suggestions";
import { ChatInput } from "./chat-input";


type RecipeAiAssistantProps = {
  recipe: Recipe;
};



type MeasurePreference = "grams" | "grams-and-cups" | "cups";

type AiChatFormValues = {
  message: string;
  measurePreference: MeasurePreference;
};



export function RecipeAiAssistant({ recipe }: RecipeAiAssistantProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [areDesktopSuggestionsVisible, setAreDesktopSuggestionsVisible] = useState(true);
  const [areMobileSuggestionsVisible, setAreMobileSuggestionsVisible] = useState(false);
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
  const renderAssistantContent = (isFullscreen = false) => {
    const areSuggestionsVisible = isFullscreen
      ? areMobileSuggestionsVisible
      : areDesktopSuggestionsVisible;

    const toggleSuggestionsVisibility = () => {
      if (isFullscreen) {
        setAreMobileSuggestionsVisible((prev) => !prev);
        return;
      }

      setAreDesktopSuggestionsVisible((prev) => !prev);
    };

    return (
      <div className={cn("flex min-w-0 flex-col gap-4", isFullscreen && "min-h-0 flex-1 gap-3 overflow-hidden")}>
        <ChatMessages
          isFullscreen={isFullscreen}
          messages={messages}
          isStreaming={isStreaming}
          streamedContent={streamedContent}
          session={session ?? null}
        />

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

        <ChatSuggestions
          isFullscreen={isFullscreen}
          areSuggestionsVisible={areSuggestionsVisible}
          sendMessage={sendMessage}
        />
        
        <ChatInput
          isFullscreen={isFullscreen}
          form={form}
          handleSubmit={handleSubmit}
          handleTextareaKeyDown={handleTextareaKeyDown}
          isStreaming={isStreaming}
          message={message}
          areSuggestionsVisible={areSuggestionsVisible}
          toggleSuggestionsVisibility={toggleSuggestionsVisibility}
        />
      </div>
    );
  };

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
            className="!fixed !inset-0 !left-0 !top-0 !flex !h-dvh !max-h-dvh !w-dvw !max-w-none !translate-x-0 !translate-y-0 !gap-0 !overflow-hidden !rounded-none !p-0 !ring-0 md:hidden"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>Assistente da receita</DialogTitle>
              <DialogDescription>
                Chat em tela cheia para conversar com o assistente Cheffy sobre esta receita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex h-dvh w-dvw min-w-0 max-w-none flex-col overflow-hidden bg-background">
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
