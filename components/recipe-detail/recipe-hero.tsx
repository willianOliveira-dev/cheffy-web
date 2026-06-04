"use client";

import { FallbackImage as Image } from "@/components/shared/fallback-image";
import Link from "next/link";
import type { ElementType } from "react";
import { ArrowLeft, Clock, Eye, Flame, Users } from "lucide-react";
import type { Recipe } from "@/api/generated/model";
import { formatDifficulty, formatMinutes, formatYield } from "@/lib/recipe-formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type RecipeHeroProps = {
  recipe: Recipe;
  backHref?: string;
  backLabel?: string;
};

export function RecipeHero({ recipe, backHref = "/receitas", backLabel = "Voltar" }: RecipeHeroProps) {
  return (
    <section className="relative min-h-[34rem] overflow-hidden bg-foreground text-background">
      <div className="absolute inset-0">
        {recipe.imageUrl && (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/20" />
      </div>

      <div className="container relative mx-auto flex min-h-[34rem] flex-col px-4 py-6 md:py-10">
        <div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-full border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
          >
            <Link href={backHref}>
              <ArrowLeft data-icon="inline-start" />
              {backLabel}
            </Link>
          </Button>
        </div>

        <div className="mt-auto pt-10 max-w-4xl text-white">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {recipe.category && (
              <Badge className="bg-white/15 text-white backdrop-blur-md hover:bg-white/20">
                {recipe.category.name}
              </Badge>
            )}
            <Badge variant="secondary" className="bg-background/90">
              {formatDifficulty(recipe.difficulty)}
            </Badge>
            {recipe.tags?.map(({ tag }) => (
              <Badge key={tag.id} asChild variant="secondary" className="bg-background/90 hover:bg-background">
                <Link href={`/receitas?tagId=${tag.id}`}>
                  #{tag.name}
                </Link>
              </Badge>
            ))}
          </div>

          <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            {recipe.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/85 md:text-xl">
            {recipe.description}
          </p>

          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroStat icon={Clock} label="Preparo" value={formatMinutes(recipe.prepTime)} />
            <HeroStat icon={Flame} label="Cozimento" value={formatMinutes(recipe.cookTime)} />
            <HeroStat icon={Users} label="Rendimento" value={formatYield(recipe.yieldAmount, recipe.yieldUnit)} />
            <HeroStat icon={Eye} label="Visualizações" value={recipe.views.toString()} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
      <div className="mb-2 flex items-center gap-2 text-white/70">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
