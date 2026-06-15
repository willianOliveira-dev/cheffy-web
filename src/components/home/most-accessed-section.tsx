"use client";

import { RecipeSummary } from "@/services/api/generated/model";
import { SectionTitle } from "@/components/shared/section-title";
import { RecipeCard } from "@/components/shared/recipe-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function MostAccessedSection({ recipes }: { recipes: RecipeSummary[] }) {
  if (!recipes?.length) return null;

  return (
    <section className="bg-muted/50 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <SectionTitle>Mais Acessadas</SectionTitle>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {recipes.map((recipe) => (
              <CarouselItem key={recipe.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="p-1 h-full">
                  <RecipeCard recipe={recipe} showViews />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute -top-14 right-12 hidden gap-2 md:flex">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
