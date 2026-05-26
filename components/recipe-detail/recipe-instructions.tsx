"use client";

import Image from "next/image";
import { Timer } from "lucide-react";
import type { RecipeSection } from "@/api/generated/model";
import { formatMinutes } from "@/lib/recipe-formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecipeInstructionsProps = {
  sections: RecipeSection[];
};

export function RecipeInstructions({ sections }: RecipeInstructionsProps) {
  const sectionsWithSteps = sections.filter((section) => section.steps?.length);

  if (!sectionsWithSteps.length) {
    return null;
  }

  return (
    <section id="preparo" className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-3xl font-bold tracking-tight">Modo de preparo</h2>
        <p className="mt-2 text-muted-foreground">
          Etapas separadas por seção, com o tempo cadastrado para cada passo quando disponível.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {sectionsWithSteps.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {[...(section.steps ?? [])]
                .sort((a, b) => a.position - b.position)
                .map((step, index) => (
                  <article key={step.id} className="grid gap-4 rounded-xl border bg-background p-4 md:grid-cols-[auto_1fr]">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          <Timer className="h-3.5 w-3.5" />
                          {formatMinutes(step.stepTime)}
                        </Badge>
                      </div>
                      <p className="text-base leading-relaxed text-foreground">{step.description}</p>
                      {step.mediaUrl && (
                        <div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-muted">
                          <Image src={step.mediaUrl} alt={`Etapa ${index + 1}`} fill className="object-cover" />
                        </div>
                      )}
                    </div>
                  </article>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
