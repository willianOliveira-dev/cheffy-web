"use client";

import { useGetHome } from "@/api/generated/home/home";
import { WeeklyHighlightsSection } from "./weekly-highlights-section";
import { MostAccessedSection } from "./most-accessed-section";
import { FeaturedRecipesSection } from "./featured-recipes-section";
import { RecipeCardSkeleton } from "@/components/shared/recipe-card-skeleton";
import { SectionTitle } from "@/components/shared/section-title";

export function HomeDynamicSections() {
  const { data, isLoading, isError } = useGetHome();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 space-y-24">
        <section>
          <SectionTitle>Destaques da Semana</SectionTitle>
          <div className="mt-12 h-96 w-full animate-pulse rounded-3xl bg-muted" />
        </section>
        <section>
          <SectionTitle>Mais Acessadas</SectionTitle>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        </section>
        <section>
          <div className="flex flex-col items-center">
            <SectionTitle className="items-center text-center">Receitas em Destaque</SectionTitle>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        Não foi possível carregar as receitas no momento.
      </div>
    );
  }

  return (
    <>
      <WeeklyHighlightsSection highlights={data.weeklyHighlights} />
      <MostAccessedSection recipes={data.mostAccessedRecipes} />
      <FeaturedRecipesSection recipes={data.featuredRecipes} />
    </>
  );
}
