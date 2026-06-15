"use client";

import { RecipeSummary } from "@/services/api/generated/model";
import { SectionTitle } from "@/components/shared/section-title";
import { RecipeCard } from "@/components/shared/recipe-card";

export function FeaturedRecipesSection({ recipes }: { recipes: RecipeSummary[] }) {
  if (!recipes?.length) return null;

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center flex flex-col items-center">
        <SectionTitle className="items-center text-center">Receitas em Destaque</SectionTitle>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Descubra uma seleção especial de receitas escolhidas a dedo para inspirar sua próxima refeição.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="h-full">
            <RecipeCard recipe={recipe} />
          </div>
        ))}
      </div>
    </section>
  );
}
