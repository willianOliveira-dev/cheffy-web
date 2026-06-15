"use client";

import { FallbackImage as Image } from "@/components/shared/fallback-image";
import { Loader2, X } from "lucide-react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RecipeItemMoveControls } from "./recipe-item-move-controls";
import type { RecipeFormValues } from "@/lib/my-recipes/recipe-form-types";

type RecipeStepEditorProps = {
  form: UseFormReturn<RecipeFormValues>;
  sectionIndex: number;
  stepIndex: number;
  stepsCount: number;
  isUploading: boolean;
  onUploadImage: (file?: File) => void;
  onRemoveImage: () => void;
  onMoveStep: (direction: -1 | 1) => void;
  onRemoveStep: () => void;
};

export function RecipeStepEditor({
  form,
  sectionIndex,
  stepIndex,
  stepsCount,
  isUploading,
  onUploadImage,
  onRemoveImage,
  onMoveStep,
  onRemoveStep,
}: RecipeStepEditorProps) {
  const imagePath = `sections.${sectionIndex}.steps.${stepIndex}.imageUrl` as const;
  const imageUrl = useWatch({ control: form.control, name: imagePath });

  return (
    <div className="min-w-0 rounded-lg bg-muted/25 p-2">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
        <Badge variant="secondary" className="mt-1">
          {stepIndex + 1}
        </Badge>
        <div className="grid min-w-0 gap-2 sm:grid-cols-[5.75rem_minmax(0,1fr)]">
          <div className="relative">
            <label
              className={cn(
                "group relative flex h-20 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed bg-background/70 text-xs text-muted-foreground transition hover:border-primary/50",
                imageUrl && "border-transparent",
                isUploading && "pointer-events-none opacity-80",
              )}
            >
              {imageUrl ? (
                <Image src={imageUrl} alt={`Imagem do passo ${stepIndex + 1}`} fill className="object-cover" />
              ) : isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="px-3 text-center">Imagem opcional</span>
              )}
              {imageUrl && !isUploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  Trocar
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={isUploading}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  onUploadImage(file);
                }}
              />
            </label>
            {imageUrl && (
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                className="absolute right-2 top-2 rounded-full bg-background/90 shadow-sm"
                onClick={onRemoveImage}
              >
                <X />
                <span className="sr-only">Remover imagem do passo</span>
              </Button>
            )}
          </div>

          <Textarea
            placeholder="Explique esse passo de um jeito simples."
            rows={2}
            className="min-h-20"
            {...form.register(`sections.${sectionIndex}.steps.${stepIndex}.description`)}
          />
        </div>
        <RecipeItemMoveControls
          index={stepIndex}
          count={stepsCount}
          onMove={onMoveStep}
          onRemove={onRemoveStep}
          removeDisabled={stepsCount === 1}
          size="icon-xs"
        />
      </div>
    </div>
  );
}
