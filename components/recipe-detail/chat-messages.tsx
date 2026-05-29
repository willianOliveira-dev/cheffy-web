import Image from "next/image";
import { User } from "lucide-react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function BotAvatar() {
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

type ChatMessagesProps = {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamedContent: string;
  session: { user?: { image?: string | null } } | null;
  isFullscreen?: boolean;
};

export function ChatMessages({
  messages,
  isStreaming,
  streamedContent,
  session,
  isFullscreen = false,
}: ChatMessagesProps) {
  return (
    <ScrollArea
      className={cn(
        "min-w-0 rounded-xl bg-muted/30",
        isFullscreen ? "min-h-0 flex-1 rounded-none bg-background" : "h-112",
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
}
