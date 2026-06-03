"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { Ingredient } from "@/api/generated/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecipeIngredientEditor } from "./recipe-ingredient-editor";
import { RecipeStepEditor } from "./recipe-step-editor";
import {
  createEmptyIngredient,
  createEmptyStep,
  type RecipeFormValues,
} from "./recipe-form-types";

type SectionEditorProps = {
  form: UseFormReturn<RecipeFormValues>;
  sectionIndex: number;
  sectionsCount: number;
  ingredients: Ingredient[];
  isLoadingIngredients: boolean;
  isIngredientsError: boolean;
  onRememberIngredient: (ingredient: Ingredient) => void;
  uploadingStepKey: string | null;
  onUploadStepImage: (sectionIndex: number, stepIndex: number, file?: File) => void;
  onRemoveStepImage: (sectionIndex: number, stepIndex: number) => void;
  onMoveSection: (direction: -1 | 1) => void;
  onRemoveSection: () => void;
};

export function SectionEditor({
  form,
  sectionIndex,
  sectionsCount,
  ingredients,
  isLoadingIngredients,
  isIngredientsError,
  onRememberIngredient,
  uploadingStepKey,
  onUploadStepImage,
  onRemoveStepImage,
  onMoveSection,
  onRemoveSection,
}: SectionEditorProps) {
  const ingredientArray = useFieldArray({
    control: form.control,
    name: `sections.${sectionIndex}.ingredients`,
  });
  const stepArray = useFieldArray({
    control: form.control,
    name: `sections.${sectionIndex}.steps`,
  });

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
      <div className="flex min-w-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Badge variant="secondary">{sectionIndex + 1}</Badge>
          <Input
            placeholder="Nome da etapa"
            className="font-medium"
            {...form.register(`sections.${sectionIndex}.title`)}
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" size="icon-sm" variant="outline" disabled={sectionIndex === 0} onClick={() => onMoveSection(-1)}>
            <ArrowUp />
          </Button>
          <Button type="button" size="icon-sm" variant="outline" disabled={sectionIndex === sectionsCount - 1} onClick={() => onMoveSection(1)}>
            <ArrowDown />
          </Button>
          <Button type="button" size="icon-sm" variant="outline" disabled={sectionsCount === 1} onClick={onRemoveSection}>
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 p-3 sm:p-4 xl:grid-cols-2">
        <RecipeSectionPanel
          title="Ingredientes"
          count={ingredientArray.fields.length}
          actionLabel="Ingrediente"
          onAdd={() => ingredientArray.append(createEmptyIngredient(ingredientArray.fields.length))}
        >
          {ingredientArray.fields.map((ingredient, ingredientIndex) => (
            <RecipeIngredientEditor
              key={ingredient.id}
              form={form}
              sectionIndex={sectionIndex}
              ingredientIndex={ingredientIndex}
              ingredientsCount={ingredientArray.fields.length}
              ingredients={ingredients}
              isLoadingIngredients={isLoadingIngredients}
              isIngredientsError={isIngredientsError}
              onRememberIngredient={onRememberIngredient}
              onMoveIngredient={(direction) => ingredientArray.move(ingredientIndex, ingredientIndex + direction)}
              onRemoveIngredient={() => ingredientArray.remove(ingredientIndex)}
            />
          ))}
        </RecipeSectionPanel>

        <RecipeSectionPanel
          title="Modo de preparo"
          count={stepArray.fields.length}
          actionLabel="Passo"
          onAdd={() => stepArray.append(createEmptyStep(stepArray.fields.length))}
        >
          {stepArray.fields.map((step, stepIndex) => (
            <RecipeStepEditor
              key={step.id}
              form={form}
              sectionIndex={sectionIndex}
              stepIndex={stepIndex}
              stepsCount={stepArray.fields.length}
              isUploading={uploadingStepKey === `${sectionIndex}:${stepIndex}`}
              onUploadImage={(file) => onUploadStepImage(sectionIndex, stepIndex, file)}
              onRemoveImage={() => onRemoveStepImage(sectionIndex, stepIndex)}
              onMoveStep={(direction) => stepArray.move(stepIndex, stepIndex + direction)}
              onRemoveStep={() => stepArray.remove(stepIndex)}
            />
          ))}
        </RecipeSectionPanel>
      </div>
    </div>
  );
}

function RecipeSectionPanel({
  title,
  count,
  actionLabel,
  onAdd,
  children,
}: {
  title: string;
  count: number;
  actionLabel: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-base font-semibold">{title}</h3>
          <Badge variant="secondary" className="shrink-0">
            {count}
          </Badge>
        </div>
        <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={onAdd}>
          <Plus data-icon="inline-start" />
          {actionLabel}
        </Button>
      </div>
      <div className="max-h-[34rem] overflow-y-auto overflow-x-hidden overscroll-contain pr-1">
        <div className="flex min-w-0 flex-col gap-2">{children}</div>
      </div>
    </div>
  );
}
