import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const suggestedQuestions = [
  "Posso substituir algum ingrediente?",
  "Como adaptar para mais porções?",
  "Me dê uma versão mais leve dessa receita.",
];

type ChatSuggestionsProps = {
  isFullscreen?: boolean;
  areSuggestionsVisible: boolean;
  toggleSuggestionsVisibility: () => void;
  sendMessage: (content: string) => void;
};

export function ChatSuggestions({
  isFullscreen = false,
  areSuggestionsVisible,
  toggleSuggestionsVisibility,
  sendMessage,
}: ChatSuggestionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        isFullscreen && "shrink-0 px-3",
      )}
    >
      {isFullscreen && (
        <button
          type="button"
          onClick={toggleSuggestionsVisibility}
          className="flex items-center gap-1.5 self-start rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {areSuggestionsVisible ? (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Ocultar sugestões
            </>
          ) : (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Mostrar sugestões
            </>
          )}
        </button>
      )}

      {(areSuggestionsVisible || !isFullscreen) && (
        <div
          className={cn(
            "flex gap-2",
            isFullscreen ? "flex-wrap" : "flex-wrap",
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
      )}
    </div>
  );
}
