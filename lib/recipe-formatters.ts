import type {
  RecipeDifficulty,
  RecipeNutritionLabel,
  RecipeSectionIngredientUnit,
  RecipeYieldUnit,
} from "@/api/generated/model";

const difficultyMap: Record<RecipeDifficulty, string> = {
  EASY: "Fácil",
  MEDIUM: "Médio",
  HARD: "Difícil",
  EXPERT: "Expert",
};

const yieldUnitMap: Record<RecipeYieldUnit, string> = {
  PORTIONS: "porções",
  PEOPLE: "pessoas",
  UNITS: "unidades",
  SLICES: "fatias",
  PIECES: "pedaços",
  CUPS: "xícaras",
  GLASSES: "copos",
  PLATES: "pratos",
  TO_TASTE: "a gosto",
};

const ingredientUnitMap: Record<RecipeSectionIngredientUnit, string> = {
  G: "g",
  KG: "kg",
  MG: "mg",
  OZ: "oz",
  LB: "lb",
  ML: "ml",
  L: "l",
  CUP: "xíc.",
  TBSP: "col. sopa",
  TSP: "col. chá",
  UNIT: "un.",
  DOZEN: "dúzia",
  PINCH: "pitada",
  DRIZZLE: "fio",
  CUBE: "cubo",
  PACKAGE: "pacote",
  CAN: "lata",
  BOTTLE: "garrafa",
  BOX: "caixa",
  TO_TASTE: "a gosto",
  CLOVE: "dente",
  BUNCH: "maço",
  GLASS: "copo",
  LEAF: "folha",
  POT: "pote",
};

export function formatDifficulty(difficulty: RecipeDifficulty) {
  return difficultyMap[difficulty] ?? difficulty;
}

export function formatYield(amount: number, unit: RecipeYieldUnit) {
  const translated = yieldUnitMap[unit] ?? unit;
  if (amount === 1 && translated.endsWith("s")) {
    if (translated === "porções") return "1 porção";
    if (translated === "pedaços") return "1 pedaço";
    if (translated === "xícaras") return "1 xícara";
    return `1 ${translated.slice(0, -1)}`;
  }

  return `${amount} ${translated}`;
}

export function formatIngredientUnit(unit: RecipeSectionIngredientUnit) {
  return ingredientUnitMap[unit] ?? unit;
}

export function formatMinutes(minutes: number | null | undefined) {
  if (!minutes || minutes <= 0) return "Sem tempo definido";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) return `${hours}h ${remainingMinutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${remainingMinutes}min`;
}

export function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatNumber(value: number | null | undefined, fractionDigits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";

  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: Number.isInteger(value) ? 0 : fractionDigits,
  }).format(value);
}

export function kcalToKj(kcal: number | null | undefined) {
  if (kcal === null || kcal === undefined) return null;
  return Math.round(kcal * 4.184);
}

export function formatNutritionServingLabel(nutrition: RecipeNutritionLabel | null | undefined) {
  if (!nutrition) return "Porção";

  const description = nutrition.servingDescription?.trim();
  if (description) return description;

  return nutrition.servingWeightInGrams
    ? `${formatNumber(nutrition.servingWeightInGrams, 0)} g`
    : "Porção";
}

export function formatNutritionServingsLabel(nutrition: RecipeNutritionLabel | null | undefined) {
  if (!nutrition) return "-";

  const description = nutrition.servingsDescription?.trim();
  if (description) return description;

  if (nutrition.servingsPerRecipe === null || nutrition.servingsPerRecipe === undefined) {
    return "-";
  }

  const unit =
    nutrition.servingsPerRecipe === 1
      ? nutrition.servingUnit
      : nutrition.servingUnitPlural ?? nutrition.servingUnit;

  return unit
    ? `${formatNumber(nutrition.servingsPerRecipe, 0)} ${unit}`
    : formatNumber(nutrition.servingsPerRecipe, 0);
}
