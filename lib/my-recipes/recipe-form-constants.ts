import type { CreateMyRecipeBodySectionsItemIngredientsItemUnit } from "@/api/generated/model";
import {
  CreateMyRecipeBodyDifficulty,
  CreateMyRecipeBodyYieldUnit,
} from "@/api/generated/model";
import type { RecipeFormValues } from "./recipe-form-types";

export const INGREDIENTS_PAGE_SIZE = 100;
export const EMPTY_TAG_IDS: string[] = [];
export const EMPTY_RECIPE_SECTIONS: RecipeFormValues["sections"] = [];

export const WEIGHT_UNIT_TO_GRAMS: Partial<Record<CreateMyRecipeBodySectionsItemIngredientsItemUnit, number>> = {
  G: 1,
  KG: 1000,
  MG: 0.001,
  OZ: 28.3495,
  LB: 453.59237,
};

export const YIELD_UNIT_LABELS: Record<CreateMyRecipeBodyYieldUnit, string> = {
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

export const DIFFICULTY_LABELS: Record<CreateMyRecipeBodyDifficulty, string> = {
  EASY: "Fácil",
  MEDIUM: "Média",
  HARD: "Difícil",
  EXPERT: "Avançada",
};

export const UNIT_LABELS: Record<CreateMyRecipeBodySectionsItemIngredientsItemUnit, string> = {
  G: "g",
  KG: "kg",
  MG: "mg",
  OZ: "oz",
  LB: "lb",
  ML: "ml",
  L: "l",
  CUP: "xícara",
  TBSP: "colher de sopa",
  TSP: "colher de chá",
  UNIT: "unidade",
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
