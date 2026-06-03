"use client";

import { FallbackImage as Image } from "@/components/shared/fallback-image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { AlertCircle, ArrowLeft, Home, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetHomeQueryKey } from "@/api/generated/home/home";
import { getGetRecipesQueryKey, useGetRecipeBySlug } from "@/api/generated/recipes/recipes";
import { getGetMyFavoriteRecipesQueryKey } from "@/api/generated/users/users";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NutritionFactsTable } from "./nutrition-facts-table";
import { PreparationModeDialog } from "./preparation-mode-dialog";
import { RecipeActionPanel } from "./recipe-action-panel";
import { RecipeAiAssistant } from "./recipe-ai-assistant";
import { RecipeHero } from "./recipe-hero";
import { RecipePrintDocument } from "./recipe-print-document";
import { RecipeSections } from "./recipe-sections";

type RecipeDetailPageClientProps = {
  slug: string;
};

const printPageStyle = `
  @page {
    size: A4;
    margin: 14mm;
  }

  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: white;
    }
  }
`;

export function RecipeDetailPageClient({ slug }: RecipeDetailPageClientProps) {
  const [isCookingModeOpen, setIsCookingModeOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { data: recipe, isLoading, isError } = useGetRecipeBySlug(slug);

  useEffect(() => {
    if (!recipe) return;

    queryClient.invalidateQueries({ queryKey: getGetRecipesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetMyFavoriteRecipesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetHomeQueryKey() });
  }, [recipe, queryClient]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: recipe ? `Cheffy - ${recipe.title}` : "Cheffy - Receita",
    pageStyle: printPageStyle,
  });

  if (isLoading) {
    return <RecipeDetailSkeleton />;
  }

  if (isError || !recipe) {
    return <RecipeNotFoundState />;
  }

  const sections = [...(recipe.sections ?? [])].sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <RecipeHero recipe={recipe} />

      <main className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-14">
        <div className="flex min-w-0 flex-col gap-10">
          <Card>
            <CardContent className="flex flex-wrap gap-2 py-4">
              {sections.map((section) => (
                <Button key={section.id} asChild variant="ghost" size="sm" className="rounded-full">
                  <a href={`#secao-${section.id}`}>{section.title}</a>
                </Button>
              ))}
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <a href="#nutricao">Nutrição</a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <a href="#assistente">Assistente IA</a>
              </Button>
            </CardContent>
          </Card>

          <RecipeSections sections={sections} />
          <NutritionFactsTable nutrition={recipe.nutritionLabel} />
          <RecipeAiAssistant recipe={recipe} />
        </div>

        <RecipeActionPanel
          recipe={recipe}
          onPrint={handlePrint}
          onOpenCookingMode={() => setIsCookingModeOpen(true)}
        />
      </main>

      <PreparationModeDialog
        open={isCookingModeOpen}
        onOpenChange={setIsCookingModeOpen}
        sections={sections}
      />

      <div className="fixed left-[-10000px] top-0 w-[794px]" aria-hidden="true">
        <RecipePrintDocument ref={printRef} recipe={recipe} />
      </div>
    </div>
  );
}

function RecipeNotFoundState() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="relative flex flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,113,84,0.16),transparent_32rem),linear-gradient(135deg,rgba(255,247,237,0.92),rgba(255,255,255,1)_42%,rgba(248,250,252,1))]" />

        <div className="container relative mx-auto grid min-h-[calc(100svh-4rem)] items-center gap-10 px-4 py-12 md:grid-cols-[minmax(0,1fr)_24rem] md:py-16 lg:gap-16">
          <section className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
              <AlertCircle className="h-4 w-4 text-primary" />
              Receita indisponível
            </div>

            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Essa receita saiu do cardápio.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              Não conseguimos carregar a receita solicitada. Ela pode ter sido removida,
              estar em rascunho ou o link pode estar incorreto.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/receitas">
                  <Search data-icon="inline-start" />
                  Explorar receitas
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-background/70">
                <Link href="/">
                  <Home data-icon="inline-start" />
                  Ir para home
                </Link>
              </Button>
            </div>

            <Button asChild variant="ghost" className="mt-4 rounded-full px-0 text-muted-foreground hover:bg-transparent">
              <Link href="/receitas">
                <ArrowLeft data-icon="inline-start" />
                Voltar para a busca de receitas
              </Link>
            </Button>
          </section>

          <aside className="hidden md:block">
            <div className="relative overflow-hidden rounded-2xl border bg-background/80 p-8 shadow-sm backdrop-blur">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-primary/10" />
              <div className="relative flex flex-col items-center text-center">
                <Image
                  src="/images/image-not-found.svg"
                  alt="Receita nao encontrada"
                  width={360}
                  height={240}
                  priority
                  className="aspect-[3/2] w-full max-w-72 rounded-xl object-cover"
                />
                <h2 className="mt-6 font-heading text-2xl font-bold">Continue cozinhando</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Use a busca para encontrar outra receita publicada com ingredientes,
                  preparo e tabela nutricional.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function RecipeDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Skeleton className="h-[34rem] w-full rounded-none" />
      <main className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    </div>
  );
}
