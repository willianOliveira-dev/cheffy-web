import type { KeyboardEvent } from "react";
import { MessageSquareText, Send } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MeasurePreference = "grams" | "grams-and-cups" | "cups";

type AiChatFormValues = {
  message: string;
  measurePreference: MeasurePreference;
};

type ChatInputProps = {
  isFullscreen?: boolean;
  form: UseFormReturn<AiChatFormValues>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleTextareaKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  isStreaming: boolean;
  message: string;
  areSuggestionsVisible?: boolean;
  toggleSuggestionsVisibility?: () => void;
};

export function ChatInput({
  isFullscreen = false,
  form,
  handleSubmit,
  handleTextareaKeyDown,
  isStreaming,
  message,
  areSuggestionsVisible = false,
  toggleSuggestionsVisibility,
}: ChatInputProps) {
  return (
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
          <div className="flex min-w-0 items-center gap-2">
            <FormField
              control={form.control}
              name="measurePreference"
              render={({ field }) => (
                <FormItem className="min-w-0">
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value === "grams" || value === "grams-and-cups" || value === "cups") {
                        field.onChange(value);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "h-9 rounded-full border-border/70 bg-background px-3 text-xs shadow-none",
                          isFullscreen ? "w-39" : "w-full sm:w-47.5",
                        )}
                      >
                        <SelectValue placeholder="Medidas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="grams">Apenas gramas</SelectItem>
                      <SelectItem value="grams-and-cups">Gramas e xícaras</SelectItem>
                      <SelectItem value="cups">Apenas xícaras</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {toggleSuggestionsVisibility && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={areSuggestionsVisible ? "secondary" : "outline"}
                      className="rounded-full"
                      aria-label={
                        areSuggestionsVisible
                          ? "Ocultar atalhos de conversa"
                          : "Mostrar atalhos de conversa"
                      }
                      onClick={toggleSuggestionsVisibility}
                    >
                      <MessageSquareText data-icon="inline-start" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {areSuggestionsVisible
                      ? "Ocultar atalhos de conversa"
                      : "Mostrar atalhos de conversa"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

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
}
