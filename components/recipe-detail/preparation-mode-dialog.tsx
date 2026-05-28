"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import type { PreparationStep, RecipeSection } from "@/api/generated/model";
import { formatMinutes, formatTimer } from "@/lib/recipe-formatters";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

type PreparationModeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: RecipeSection[];
};

type TimedStep = PreparationStep & {
  sectionTitle: string;
};

export function PreparationModeDialog({ open, onOpenChange, sections }: PreparationModeDialogProps) {
  const steps = useMemo(
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
  const [remainingSeconds, setRemainingSeconds] = useState(getStepSeconds(steps[0]));
  const [isRunning, setIsRunning] = useState(false);
  const activeStep = steps[activeIndex];
  const activeStepSeconds = getStepSeconds(activeStep);
  const progress = activeStepSeconds > 0 ? ((activeStepSeconds - remainingSeconds) / activeStepSeconds) * 100 : 0;

  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  const goToStep = (nextIndex: number) => {
    const safeIndex = Math.min(Math.max(nextIndex, 0), steps.length - 1);
    setActiveIndex(safeIndex);
    setRemainingSeconds(getStepSeconds(steps[safeIndex]));
    setIsRunning(false);
  };

  const resetStep = () => {
    setRemainingSeconds(activeStepSeconds);
    setIsRunning(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modo de preparo</DialogTitle>
          <DialogDescription>
            Siga uma etapa por vez e use o timer exato cadastrado para cada passo.
          </DialogDescription>
        </DialogHeader>

        {!activeStep ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            Esta receita ainda não possui etapas cadastradas.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border bg-muted/30 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Etapa {activeIndex + 1} de {steps.length} · {activeStep.sectionTitle}
                  </p>
                  <p className="mt-1 font-heading text-2xl font-bold">
                    {formatMinutes(activeStep.stepTime)}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-background px-4 py-2 font-mono text-2xl font-bold tabular-nums">
                  <TimerReset className="h-5 w-5 text-primary" />
                  {activeStepSeconds > 0 ? formatTimer(remainingSeconds) : "--:--"}
                </div>
              </div>

              <Progress value={progress} className="h-2" />

              <p className="mt-5 text-base leading-relaxed">
                {activeStep.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="icon" onClick={() => goToStep(activeIndex - 1)} disabled={activeIndex === 0}>
                  <ArrowLeft />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => goToStep(activeIndex + 1)} disabled={activeIndex === steps.length - 1}>
                  <ArrowRight />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={resetStep} disabled={activeStepSeconds === 0}>
                  <RotateCcw data-icon="inline-start" />
                  Reiniciar
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsRunning((current) => !current)}
                  disabled={activeStepSeconds === 0 || remainingSeconds === 0}
                >
                  {isRunning ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
                  {isRunning ? "Pausar" : "Iniciar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getStepSeconds(step: TimedStep | undefined) {
  if (!step?.stepTime || step.stepTime <= 0) return 0;
  return step.stepTime * 60;
}
