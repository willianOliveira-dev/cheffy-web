"use client";

import { useRecipeDetail } from "@/hooks/use-recipe-detail";
import { SiteHeader } from "@/components/layout/site-header";
import { RecipeDetailLoadingState } from "./recipe-detail-loading-state";
import { RecipeDetailNotFoundState } from "./recipe-detail-not-found-state";
import { RecipeDetailView } from "./recipe-detail-view";

type RecipeDetailPageClientProps = {
  slug?: string;
  recipeId?: string;
  privateView?: boolean;
};

export function RecipeDetailPageClient(props: RecipeDetailPageClientProps) {
  const { recipe, isLoading, isUnavailable, privateView } = useRecipeDetail(props);

  if (isLoading) {
    return <RecipeDetailLoadingState />;
  }

  if (isUnavailable || !recipe) {
    return <RecipeDetailNotFoundState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <RecipeDetailView recipe={recipe} privateView={privateView} />
    </div>
  );
}
