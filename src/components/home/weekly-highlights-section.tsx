"use client";

import { FallbackImage as Image } from "@/components/shared/fallback-image";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { RecipeSummary } from "@/services/api/generated/model";
import { SectionTitle } from "@/components/shared/section-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function WeeklyHighlightsSection({ highlights }: { highlights: RecipeSummary[] }) {
  if (!highlights?.length) return null;

  return (
    <section id="destaques" className="container mx-auto px-4 py-24">
      <div className="mb-12 flex items-end justify-between">
        <SectionTitle>Destaques da Semana</SectionTitle>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {highlights.map((recipe) => (
            <CarouselItem key={recipe.id}>
              <div className="grid overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm md:grid-cols-2">
                <div className="relative aspect-square md:aspect-auto">
                  {recipe.imageUrl && (
                    <Image
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <Badge 
                    className="absolute left-6 top-6 bg-background/90 text-foreground backdrop-blur-sm hover:bg-background"
                  >
                    {recipe.category.name}
                  </Badge>
                </div>
                
                <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
                  <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.totalTime} min de preparo</span>
                  </div>
                  
                  <h3 className="mb-4 font-heading text-3xl font-bold leading-tight text-foreground lg:text-4xl">
                    {recipe.title}
                  </h3>
                  
                  <p className="mb-8 text-lg text-muted-foreground line-clamp-3">
                    {recipe.description}
                  </p>
                  
                  <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border">
                        <span className="font-medium text-sm">
                          {recipe.author?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{recipe.author?.name}</p>
                        <p className="text-xs text-muted-foreground">Por Cheffy</p>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full rounded-full sm:w-auto">
                      <Link href={`/receitas/${recipe.slug}`}>
                        Ver Receita <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute -top-14 right-12 hidden gap-2 md:flex">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
    </section>
  );
}
