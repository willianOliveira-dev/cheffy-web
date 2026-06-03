"use client";

import { CookingPot, Printer } from "lucide-react";
import type { Recipe } from "@/api/generated/model";
import { formatDifficulty, formatMinutes, formatYield } from "@/lib/recipe-formatters";
import { FavoriteRecipeButton } from "@/components/shared/favorite-recipe-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RecipeShareGrid } from "./recipe-share-grid";

type RecipeActionPanelProps = {
  recipe: Recipe;
  onPrint: () => void;
  onOpenCookingMode: () => void;
};

export function RecipeActionPanel({ recipe, onPrint, onOpenCookingMode }: RecipeActionPanelProps) {
  return (
    <aside className="order-first flex flex-col gap-4 lg:sticky lg:top-24 lg:order-0">
      <Card>
        <CardHeader>
          <CardTitle>Resumo da receita</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <SummaryItem label="Tempo total" value={formatMinutes(recipe.totalTime)} />
            <SummaryItem label="Dificuldade" value={formatDifficulty(recipe.difficulty)} />
            <SummaryItem label="Rendimento" value={formatYield(recipe.yieldAmount, recipe.yieldUnit)} />
            <SummaryItem label="Favoritos" value={recipe.totalFavorites.toString()} />
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <FavoriteRecipeButton
              recipeId={recipe.id}
              initialFavorited={recipe.isFavorited}
              variant="default"
              size="lg"
              className="w-full"
            />
            <Button type="button" variant="outline" className="w-full rounded-full" onClick={onOpenCookingMode}>
              <CookingPot data-icon="inline-start" />
              Modo cozinha
            </Button>
            <Button type="button" variant="outline" className="w-full rounded-full" onClick={onPrint}>
              <Printer data-icon="inline-start" />
              Imprimir receita
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compartilhar</CardTitle>
        </CardHeader>
        <CardContent>
          <RecipeShareGrid recipe={recipe} />
        </CardContent>
      </Card>
    </aside>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}
