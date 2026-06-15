import type { Ingredient } from "@/services/api/generated/model";
import type { RecipeFormValues } from "@/lib/my-recipes/recipe-form-types";

export type NutritionKey =
  | "energyKcal"
  | "carbohydrates"
  | "totalSugars"
  | "addedSugars"
  | "protein"
  | "totalFat"
  | "saturatedFat"
  | "transFat"
  | "fiber"
  | "sodiumMg";

export type NutritionValues = Record<NutritionKey, number>;

export type NutritionPreviewIngredient = {
  name: string;
  displayText: string;
  quantity: string;
  quantityInGrams: number;
  unit: string;
  sectionTitle: string;
  hasNutrition: boolean;
};

export type NutritionPreview = {
  ingredients: NutritionPreviewIngredient[];
  totals: NutritionValues;
  per100g: NutritionValues;
  perServing: NutritionValues;
  dailyValuePercent: Partial<NutritionValues>;
  totalWeightInGrams: number;
  servingWeightInGrams: number;
  servingsPerRecipe: number;
  isApproximate: boolean;
};

type NutritionPreviewSource = Pick<RecipeFormValues, "sections" | "yieldAmount" | "yieldUnit">;

const DAILY_VALUES = {
  energyKcal: 2000,
  carbohydrates: 275,
  addedSugars: 50,
  protein: 50,
  totalFat: 78,
  saturatedFat: 20,
  fiber: 28,
  sodiumMg: 2300,
} satisfies Partial<NutritionValues>;

const EMPTY_NUTRITION: NutritionValues = {
  energyKcal: 0,
  carbohydrates: 0,
  totalSugars: 0,
  addedSugars: 0,
  protein: 0,
  totalFat: 0,
  saturatedFat: 0,
  transFat: 0,
  fiber: 0,
  sodiumMg: 0,
};

export function calculateNutritionPreview(
  values: NutritionPreviewSource,
  ingredients: Ingredient[],
): NutritionPreview {
  const ingredientMap = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const totals: NutritionValues = { ...EMPTY_NUTRITION };
  const previewIngredients: NutritionPreviewIngredient[] = [];
  let totalWeightInGrams = 0;
  let hasMissingNutrition = false;

  for (const section of values.sections) {
    for (const ingredientInput of section.ingredients) {
      const quantityInGrams = Number(ingredientInput.quantityInGrams) || 0;
      const ingredient = ingredientMap.get(ingredientInput.ingredientId);
      const nutrition = ingredient?.nutrition;

      totalWeightInGrams += quantityInGrams;

      previewIngredients.push({
        name: ingredient?.name || ingredientInput.displayText || "Ingrediente",
        displayText: ingredientInput.displayText,
        quantity: ingredientInput.quantity || "-",
        quantityInGrams,
        unit: ingredientInput.unit,
        sectionTitle: section.title || "Etapa",
        hasNutrition: Boolean(nutrition),
      });

      if (!nutrition) {
        if (ingredientInput.ingredientId) hasMissingNutrition = true;
        continue;
      }

      const multiplier = quantityInGrams / 100;
      totals.energyKcal += nutrition.energyKcalPer100g * multiplier;
      totals.carbohydrates += nutrition.carbohydratesPer100g * multiplier;
      totals.totalSugars += (nutrition.totalSugarsPer100g ?? 0) * multiplier;
      totals.addedSugars += (nutrition.addedSugarsPer100g ?? 0) * multiplier;
      totals.protein += nutrition.proteinPer100g * multiplier;
      totals.totalFat += nutrition.totalFatPer100g * multiplier;
      totals.saturatedFat += (nutrition.saturatedFatPer100g ?? 0) * multiplier;
      totals.transFat += (nutrition.transFatPer100g ?? 0) * multiplier;
      totals.fiber += (nutrition.fiberPer100g ?? 0) * multiplier;
      totals.sodiumMg += (nutrition.sodiumMgPer100g ?? 0) * multiplier;
    }
  }

  const servingsPerRecipe =
    values.yieldUnit === "TO_TASTE" ? 1 : Math.max(Number(values.yieldAmount) || 1, 1);
  const servingWeightInGrams = totalWeightInGrams > 0 ? totalWeightInGrams / servingsPerRecipe : 0;
  const per100gMultiplier = totalWeightInGrams > 0 ? 100 / totalWeightInGrams : 0;
  const perServingMultiplier = 1 / servingsPerRecipe;

  const per100g = mapNutritionValues(totals, (value) => value * per100gMultiplier);
  const perServing = mapNutritionValues(totals, (value) => value * perServingMultiplier);

  return {
    ingredients: previewIngredients,
    totals,
    per100g,
    perServing,
    dailyValuePercent: {
      energyKcal: (perServing.energyKcal / DAILY_VALUES.energyKcal) * 100,
      carbohydrates: (perServing.carbohydrates / DAILY_VALUES.carbohydrates) * 100,
      addedSugars: (perServing.addedSugars / DAILY_VALUES.addedSugars) * 100,
      protein: (perServing.protein / DAILY_VALUES.protein) * 100,
      totalFat: (perServing.totalFat / DAILY_VALUES.totalFat) * 100,
      saturatedFat: (perServing.saturatedFat / DAILY_VALUES.saturatedFat) * 100,
      fiber: (perServing.fiber / DAILY_VALUES.fiber) * 100,
      sodiumMg: (perServing.sodiumMg / DAILY_VALUES.sodiumMg) * 100,
    },
    totalWeightInGrams,
    servingWeightInGrams,
    servingsPerRecipe,
    isApproximate: hasMissingNutrition,
  };
}

function mapNutritionValues(
  values: NutritionValues,
  mapValue: (value: number) => number,
): NutritionValues {
  return {
    energyKcal: mapValue(values.energyKcal),
    carbohydrates: mapValue(values.carbohydrates),
    totalSugars: mapValue(values.totalSugars),
    addedSugars: mapValue(values.addedSugars),
    protein: mapValue(values.protein),
    totalFat: mapValue(values.totalFat),
    saturatedFat: mapValue(values.saturatedFat),
    transFat: mapValue(values.transFat),
    fiber: mapValue(values.fiber),
    sodiumMg: mapValue(values.sodiumMg),
  };
}
