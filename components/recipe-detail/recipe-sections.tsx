"use client";

import Image from "next/image";
import { PackageOpen } from "lucide-react";
import type { RecipeSection } from "@/api/generated/model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecipeSectionsProps = {
  sections: RecipeSection[];
};

export function RecipeSections({ sections }: RecipeSectionsProps) {
  if (!sections.length) {
    return null;
  }

  return (
    <section id="secoes" className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-3xl font-bold tracking-tight">Seções da receita</h2>
        <p className="mt-2 text-muted-foreground">
          Ingredientes e modo de preparo passo a passo.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {sections.map((section) => {
          const ingredients = [...(section.ingredients ?? [])].sort((a, b) => a.position - b.position);
          const steps = [...(section.steps ?? [])].sort((a, b) => a.position - b.position);

          return (
            <Card key={section.id} id={`secao-${section.id}`} className="scroll-mt-24">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 pt-4">
                {ingredients.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-heading text-xl font-bold">Ingredientes</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ingredients.map((item) => (
                        <div
                          key={item.id}
                          className="flex min-h-20 items-center gap-3 rounded-xl border bg-background p-3"
                        >
                          <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                            {item.ingredient?.imageUrl ? (
                              <Image
                                src={item.ingredient.imageUrl}
                                alt={item.ingredient.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <PackageOpen className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-medium leading-snug">{item.displayText}</p>
                            {item.notes && (
                              <p className="mt-1 text-xs leading-snug text-muted-foreground">{item.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {steps.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-heading text-xl font-bold">Modo de preparo</h3>
                    <div className="flex flex-col gap-4">
                      {steps.map((step, index) => (
                        <article
                          key={step.id}
                          className="grid gap-4 rounded-xl border bg-background p-4 md:grid-cols-[auto_1fr]"
                        >
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-base leading-relaxed text-foreground">{step.description}</p>
                            {step.imageUrl && (
                              <div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-muted">
                                <Image src={step.imageUrl} alt={`Etapa ${index + 1}`} fill className="object-cover" />
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
