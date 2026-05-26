"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Eye, Users } from "lucide-react";
import { RecipeSummary } from "@/api/generated/model";
import { formatYield } from "@/lib/recipe-formatters";
import { FavoriteRecipeButton } from "@/components/shared/favorite-recipe-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type RecipeCardProps = {
  recipe: RecipeSummary;
  showViews?: boolean;
};

function formatViewCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return count.toString();
}

export function RecipeCard({ recipe, showViews = false }: RecipeCardProps) {
  const stopCardNavigation = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Link href={`/receitas/${recipe.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-md border-border/50 bg-card">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
          {recipe.imageUrl && (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <Badge
            variant="secondary"
            className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur-sm hover:bg-background"
          >
            {recipe.category.name}
          </Badge>

          <FavoriteRecipeButton
            recipeId={recipe.id}
            initialFavorited={recipe.isFavorited}
            showLabel={false}
            size="icon"
            variant="ghost"
            className="absolute right-3 top-3 rounded-full bg-background/90 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-destructive"
            onClickCapture={stopCardNavigation}
          />
        </div>

        <CardContent className="flex flex-1 flex-col p-4">
          <h3 className="font-heading text-xl font-bold leading-tight text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{recipe.totalTime} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{formatYield(recipe.yieldAmount, recipe.yieldUnit)}</span>
            </div>
            {showViews && (
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{formatViewCount(recipe.views)}</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
