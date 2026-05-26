"use client";

import Image from "next/image";
import { PackageOpen } from "lucide-react";
import type { RecipeSection } from "@/api/generated/model";
import { formatIngredientUnit } from "@/lib/recipe-formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecipeIngredientsProps = {
  sections: RecipeSection[];
};

export function RecipeIngredients({ sections }: RecipeIngredientsProps) {
  const sectionsWithIngredients = sections.filter((section) => section.ingredients?.length);

  if (!sectionsWithIngredients.length) {
    return null;
  }

  return (
    <section id="ingredientes" className="flex flex-col gap-5">
      <SectionHeading
        title="Ingredientes"
        description="Itens organizados por seção da receita, com as imagens cadastradas para cada ingrediente."
      />

      <div className="grid gap-4">
        {sectionsWithIngredients.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[...(section.ingredients ?? [])]
                  .sort((a, b) => a.position - b.position)
                  .map((item) => (
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
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {item.quantity && (
                            <Badge variant="secondary">
                              {item.quantity}
                            </Badge>
                          )}
                          {item.quantityInGrams > 0 && <span>{item.quantityInGrams} g na receita</span>}
                          {item.notes && <span>{item.notes}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="font-heading text-3xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
