"use client";

import { Plus } from "lucide-react";
import type { RecipeFormController } from "@/lib/my-recipes/use-recipe-form-controller";
import { createEmptySection } from "@/lib/my-recipes/recipe-form-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionEditor } from "./recipe-section-editor";

type RecipeSectionsCardProps = {
  controller: RecipeFormController;
};

export function RecipeSectionsCard({ controller }: RecipeSectionsCardProps) {
  const { form, sectionArray } = controller;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-xl md:text-2xl">Ingredientes e preparo</CardTitle>
          <CardDescription>Liste os ingredientes e explique o preparo em passos simples.</CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => sectionArray.append(createEmptySection(sectionArray.fields.length))}
        >
          <Plus data-icon="inline-start" />
          Nova etapa
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {sectionArray.fields.map((section, sectionIndex) => (
          <SectionEditor
            key={section.id}
            form={form}
            sectionIndex={sectionIndex}
            sectionsCount={sectionArray.fields.length}
            ingredients={controller.ingredients}
            isLoadingIngredients={controller.isLoadingIngredients}
            isIngredientsError={controller.isIngredientsError}
            onRememberIngredient={controller.rememberIngredient}
            uploadingStepKey={controller.uploadingStepKey}
            onUploadStepImage={controller.handleStepImageChange}
            onRemoveStepImage={controller.handleRemoveStepImage}
            onMoveSection={(direction) => sectionArray.move(sectionIndex, sectionIndex + direction)}
            onRemoveSection={() => sectionArray.remove(sectionIndex)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
