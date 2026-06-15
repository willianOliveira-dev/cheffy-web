import type {
  CreateMyRecipeBodyDifficulty,
  CreateMyRecipeBodySectionsItemIngredientsItemUnit,
  CreateMyRecipeBodyYieldUnit,
} from "@/services/api/generated/model";

export type RecipeFormIngredient = {
  displayText: string;
  quantity: string;
  quantityInGrams?: number;
  unit: CreateMyRecipeBodySectionsItemIngredientsItemUnit;
  notes: string;
  position: number;
  ingredientId: string;
};

export type RecipeFormStep = {
  id?: string;
  description: string;
  position: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
};

export type RecipeFormSection = {
  title: string;
  position: number;
  ingredients: RecipeFormIngredient[];
  steps: RecipeFormStep[];
};

export type RecipeFormValues = {
  title: string;
  description: string;
  imageUrl: string | null;
  imagePublicId?: string | null;
  prepTime?: number;
  cookTime?: number;
  yieldAmount?: number;
  yieldUnit: CreateMyRecipeBodyYieldUnit;
  difficulty: CreateMyRecipeBodyDifficulty;
  categoryId: string;
  tagIds: string[];
  sections: RecipeFormSection[];
};

export type RecipeFormMode = "create" | "edit";
