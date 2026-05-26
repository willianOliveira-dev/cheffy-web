"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetRecipeBySlug, getGetRecipesQueryKey } from "@/api/generated/recipes/recipes";
import { getGetMyFavoriteRecipesQueryKey } from "@/api/generated/users/users";
import { getGetHomeQueryKey } from "@/api/generated/home/home";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RecipeHero } from "./recipe-hero";
import { RecipeActionPanel } from "./recipe-action-panel";
import { RecipeIngredients } from "./recipe-ingredients";
import { RecipeInstructions } from "./recipe-instructions";
import { NutritionFactsTable } from "./nutrition-facts-table";
import { RecipeAiAssistant } from "./recipe-ai-assistant";
import { PreparationModeDialog } from "./preparation-mode-dialog";
import { RecipePrintDocument } from "./recipe-print-document";

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
    if (recipe) {
      queryClient.invalidateQueries({ queryKey: getGetRecipesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetMyFavoriteRecipesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetHomeQueryKey() });
    }
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
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle />
            <AlertTitle>Receita não encontrada</AlertTitle>
            <AlertDescription>
              Não foi possível carregar essa receita. Ela pode ter sido removida ou ainda não está publicada.
            </AlertDescription>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/receitas">Voltar para receitas</Link>
              </Button>
            </div>
          </Alert>
        </main>
      </div>
    );
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
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <a href="#ingredientes">Ingredientes</a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <a href="#preparo">Preparo</a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <a href="#nutricao">Nutrição</a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <a href="#assistente">Assistente IA</a>
              </Button>
            </CardContent>
          </Card>

          <RecipeIngredients sections={sections} />
          <RecipeInstructions sections={sections} />
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
