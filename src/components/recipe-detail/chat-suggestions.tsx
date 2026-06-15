import { cn } from "@/utils/class-names";
import { Button } from "@/components/ui/button";

const suggestedQuestions = [
  "Posso substituir algum ingrediente?",
  "Como adaptar para mais porções?",
  "Me dê uma versão mais leve dessa receita.",
];

type ChatSuggestionsProps = {
  isFullscreen?: boolean;
  areSuggestionsVisible: boolean;
  sendMessage: (content: string) => void;
};

export function ChatSuggestions({
  isFullscreen = false,
  areSuggestionsVisible,
  sendMessage,
}: ChatSuggestionsProps) {
  if (!areSuggestionsVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        isFullscreen && "shrink-0 px-3",
      )}
    >
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((question) => (
          <Button
            key={question}
            type="button"
            size="sm"
            variant="outline"
            className={cn(
              "rounded-full",
              isFullscreen && "h-auto min-h-8 min-w-0 max-w-full whitespace-normal text-left text-xs",
            )}
            onClick={() => sendMessage(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
