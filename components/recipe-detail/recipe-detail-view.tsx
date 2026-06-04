"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import type { Recipe } from "@/api/generated/model";
import { NutritionFactsTable } from "./nutrition-facts-table";
import { PreparationModeDialog } from "./preparation-mode-dialog";
import { RecipeActionPanel } from "./recipe-action-panel";
import { RecipeAiAssistant } from "./recipe-ai-assistant";
import { RecipeDetailSectionNav } from "./recipe-detail-section-nav";
import { RecipeHero } from "./recipe-hero";
import { RecipePrintDocument } from "./recipe-print-document";
import { RecipeSections } from "./recipe-sections";

type RecipeDetailViewProps = {
  recipe: Recipe;
  privateView?: boolean;
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

export function RecipeDetailView({ recipe, privateView = false }: RecipeDetailViewProps) {
  const [isCookingModeOpen, setIsCookingModeOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const sections = [...(recipe.sections ?? [])].sort((a, b) => a.position - b.position);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Cheffy - ${recipe.title}`,
    pageStyle: printPageStyle,
  });

  return (
    <>
      <RecipeHero
        recipe={recipe}
        backHref={privateView ? "/minhas-receitas" : "/receitas"}
        backLabel={privateView ? "Minhas receitas" : "Voltar"}
      />

      <main className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-14">
        <div className="flex min-w-0 flex-col gap-10">
          <RecipeDetailSectionNav sections={sections} />
          <RecipeSections sections={sections} />
          <NutritionFactsTable nutrition={recipe.nutritionLabel} />
          <RecipeAiAssistant recipe={recipe} />
        </div>

        <RecipeActionPanel
          recipe={recipe}
          onPrint={handlePrint}
          onOpenCookingMode={() => setIsCookingModeOpen(true)}
          showPublicActions={!privateView}
        />
      </main>

      <PreparationModeDialog
        open={isCookingModeOpen}
        onOpenChange={setIsCookingModeOpen}
        sections={sections}
      />

      <div className="fixed -left-2500 top-0 w-198.5" aria-hidden="true">
        <RecipePrintDocument ref={printRef} recipe={recipe} />
      </div>
    </>
  );
}
