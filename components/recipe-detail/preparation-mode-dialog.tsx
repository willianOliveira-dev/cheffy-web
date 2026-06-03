"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Keyboard, X } from "lucide-react";
import type { PreparationStep, RecipeSection } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type PreparationModeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: RecipeSection[];
};

type CookingStep = PreparationStep & {
  sectionTitle: string;
};

export function PreparationModeDialog({ open, onOpenChange, sections }: PreparationModeDialogProps) {
  const steps = useMemo<CookingStep[]>(
    () =>
      sections.flatMap((section) =>
        [...(section.steps ?? [])]
          .sort((a, b) => a.position - b.position)
          .map((step) => ({
            ...step,
            sectionTitle: section.title,
          })),
      ),
    [sections],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const safeActiveIndex = steps.length > 0 ? Math.min(activeIndex, steps.length - 1) : 0;
  const activeStep = steps[safeActiveIndex];
  const progress = steps.length > 0 ? ((safeActiveIndex + 1) / steps.length) * 100 : 0;
  const isCompleted = activeStep ? completedStepIds.includes(activeStep.id) : false;

  const goToStep = useCallback(
    (nextIndex: number) => {
      if (!steps.length) return;
      setExpandedImageUrl(null);
      setActiveIndex(Math.min(Math.max(nextIndex, 0), steps.length - 1));
    },
    [steps.length],
  );

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToStep(activeIndex - 1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToStep(activeIndex + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, goToStep, open]);

  function toggleCompleted() {
    if (!activeStep) return;

    setCompletedStepIds((current) =>
      current.includes(activeStep.id)
        ? current.filter((stepId) => stepId !== activeStep.id)
        : [...current, activeStep.id],
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid h-svh max-h-svh w-screen max-w-none grid-rows-[auto_1fr_auto] gap-0 overflow-hidden rounded-none p-0 sm:max-w-none"
      >
        <header className="flex min-h-14 items-center justify-between gap-3 border-b bg-background px-4">
          <div className="flex min-w-0 items-center gap-4">
            <DialogTitle className="shrink-0 font-heading text-xl font-bold md:text-2xl">
              modo cozinha
            </DialogTitle>
            <DialogDescription className="hidden items-center gap-1 text-sm md:flex">
              <Keyboard className="h-4 w-4" />
              Use as setas para navegar. Esc fecha.
              {activeStep?.imageUrl ? " Clique na imagem para ampliar." : ""}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Fechar modo cozinha">
              <X />
            </Button>
          </DialogClose>
        </header>

        {!activeStep ? (
          <div className="flex items-center justify-center p-6 text-center text-muted-foreground">
            Esta receita ainda não possui etapas cadastradas.
          </div>
        ) : (
          <main
            className={cn(
              "kitchen-mode-surface min-h-0",
              activeStep.imageUrl ? "grid lg:grid-cols-[42vw_1fr]" : "flex items-center justify-center",
            )}
          >
            <div className={cn("relative min-h-64 overflow-hidden bg-muted lg:min-h-0", !activeStep.imageUrl && "hidden")}>
              {activeStep.imageUrl && (
                <button
                  type="button"
                  className="relative h-full w-full cursor-zoom-in"
                  onClick={() => setExpandedImageUrl(activeStep.imageUrl)}
                >
                  <Image
                    src={activeStep.imageUrl}
                    alt={`Passo ${safeActiveIndex + 1}`}
                    fill
                    priority
                    className="object-cover"
                  />
                </button>
              )}
            </div>

            <div className="flex min-h-0 w-full items-center justify-center overflow-y-auto px-6 py-10 md:px-12">
              <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-7 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {activeStep.sectionTitle}
                </p>
                <h2 className="kitchen-step-title font-heading text-3xl font-bold md:text-4xl">
                  Passo {safeActiveIndex + 1}
                </h2>
                <p className="kitchen-step-copy text-xl leading-loose md:text-2xl">
                  {activeStep.description}
                </p>
                <Button
                  type="button"
                  variant={isCompleted ? "default" : "outline"}
                  className={cn(
                    "w-full max-w-3xl rounded-full",
                    isCompleted && "kitchen-done-button",
                  )}
                  onClick={toggleCompleted}
                >
                  {isCompleted ? (
                    "Feito"
                  ) : (
                    <>
                      <Check data-icon="inline-start" />
                      marquei como feito
                    </>
                  )}
                </Button>
              </div>
            </div>

            {expandedImageUrl && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/85 p-4">
                <Button
                  type="button"
                  className="absolute right-4 top-4 rounded-full bg-background p-2 text-foreground"
                  aria-label="Fechar imagem ampliada"
                  onClick={() => setExpandedImageUrl(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="relative h-full max-h-[88vh] w-full max-w-6xl">
                  <Image src={expandedImageUrl} alt="Imagem ampliada do passo" fill className="object-contain" />
                </div>
              </div>
            )}
          </main>
        )}

        <footer className="grid gap-3 border-t bg-background px-4 py-3 md:grid-cols-[20rem_1fr_20rem] md:items-center">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => goToStep(activeIndex - 1)}
            disabled={!activeStep || safeActiveIndex === 0}
          >
            <ArrowLeft data-icon="inline-start" />
            Anterior
          </Button>

          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">
              {steps.length ? `${safeActiveIndex + 1}/${steps.length}` : "0/0"}
            </span>
            <Progress value={progress} className="h-2 w-full max-w-xs" />
          </div>

          <Button
            type="button"
            className="rounded-full"
            onClick={() => goToStep(activeIndex + 1)}
            disabled={!activeStep || safeActiveIndex === steps.length - 1}
          >
            Próximo
            <ArrowRight data-icon="inline-end" />
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
