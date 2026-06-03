"use client";

import { useDeferredValue, useMemo } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { Ingredient } from "@/api/generated/model";
import { calculateNutritionPreview } from "@/lib/recipe-nutrition-preview";
import { EMPTY_RECIPE_SECTIONS } from "./recipe-form-constants";
import type { RecipeFormValues } from "./recipe-form-types";
import { NutritionPreviewPanel } from "./nutrition-preview-panel";

type RecipeNutritionPreviewProps = {
  form: UseFormReturn<RecipeFormValues>;
  ingredients: Ingredient[];
};

export function RecipeNutritionPreview({ form, ingredients }: RecipeNutritionPreviewProps) {
  const sections = useWatch({ control: form.control, name: "sections" }) ?? EMPTY_RECIPE_SECTIONS;
  const yieldAmount = useWatch({ control: form.control, name: "yieldAmount" });
  const yieldUnit = useWatch({ control: form.control, name: "yieldUnit" }) ?? "PORTIONS";
  const nutritionValues = useMemo(
    () => ({ sections, yieldAmount, yieldUnit }),
    [sections, yieldAmount, yieldUnit],
  );
  const deferredNutritionValues = useDeferredValue(nutritionValues);
  const preview = useMemo(
    () => calculateNutritionPreview(deferredNutritionValues, ingredients),
    [deferredNutritionValues, ingredients],
  );

  return <NutritionPreviewPanel preview={preview} />;
}
