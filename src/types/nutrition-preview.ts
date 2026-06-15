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
