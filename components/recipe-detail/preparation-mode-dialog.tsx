"use client";

import { FallbackImage as Image } from "@/components/shared/fallback-image";
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
              "kitchen-mode-surface relative min-h-0 overflow-y-auto px-4 py-6 md:px-8 md:py-10",
              activeStep.imageUrl ? "flex items-center justify-center" : "flex items-center justify-center",
            )}
          >
            <div
              className={cn(
                "mx-auto grid w-full max-w-6xl overflow-hidden rounded-xl bg-[#fff9f2] shadow-sm ring-1 ring-black/5",
                activeStep.imageUrl ? "md:grid-cols-[minmax(18rem,0.95fr)_minmax(22rem,1.05fr)]" : "max-w-4xl",
              )}
            >
              {activeStep.imageUrl && (
                <button
                  type="button"
                  className="group relative min-h-64 cursor-zoom-in overflow-hidden bg-muted text-left md:min-h-96"
                  onClick={() => setExpandedImageUrl(activeStep.imageUrl)}
                >
                  <Image
                    src={activeStep.imageUrl}
                    alt={`Imagem do passo ${safeActiveIndex + 1}`}
                    fill
                    priority
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-lg md:size-12 md:text-lg">
                    {safeActiveIndex + 1}
                  </span>
                </button>
              )}

              <div className="flex min-h-80 w-full items-center justify-center px-6 py-8 md:px-10 lg:px-14">
                <div className={cn("flex w-full flex-col gap-6", activeStep.imageUrl ? "text-left" : "items-center text-center")}>
                  <div className={cn("flex flex-col gap-2", !activeStep.imageUrl && "items-center")}>
                    <p className="text-sm font-medium text-muted-foreground">
                      {activeStep.sectionTitle}
                    </p>
                    <h2 className="kitchen-step-title font-heading text-3xl font-bold md:text-4xl">
                      Passo {safeActiveIndex + 1}
                    </h2>
                  </div>
                  <p className="kitchen-step-copy text-lg leading-loose md:text-xl">
                    {activeStep.description}
                  </p>
                  <Button
                    type="button"
                    variant={isCompleted ? "default" : "outline"}
                    className={cn(
                      "w-full rounded-full",
                      !activeStep.imageUrl && "max-w-3xl",
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
