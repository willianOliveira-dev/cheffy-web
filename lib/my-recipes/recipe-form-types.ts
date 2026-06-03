import type {
  CreateMyRecipeBodyDifficulty,
  CreateMyRecipeBodySectionsItemIngredientsItemUnit,
  CreateMyRecipeBodyYieldUnit,
  Recipe,
} from "@/api/generated/model";

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

export function createEmptyRecipeFormValues(): RecipeFormValues {
  return {
    title: "",
    description: "",
    imageUrl: null,
    imagePublicId: undefined,
    prepTime: undefined,
    cookTime: undefined,
    yieldAmount: undefined,
    yieldUnit: "PORTIONS",
    difficulty: "MEDIUM",
    categoryId: "",
    tagIds: [],
    sections: [createEmptySection(0)],
  };
}

export function createEmptySection(position: number): RecipeFormSection {
  return {
    title: "",
    position,
    ingredients: [createEmptyIngredient(0)],
    steps: [createEmptyStep(0)],
  };
}

export function createEmptyIngredient(position: number): RecipeFormIngredient {
  return {
    displayText: "",
    quantity: "",
    quantityInGrams: undefined,
    unit: "G",
    notes: "",
    position,
    ingredientId: "",
  };
}

export function createEmptyStep(position: number): RecipeFormStep {
  return {
    description: "",
    position,
    imageUrl: null,
    imagePublicId: null,
  };
}

export function mapRecipeToFormValues(recipe: Recipe): RecipeFormValues {
  return {
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    imagePublicId: undefined,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    yieldAmount: recipe.yieldAmount,
    yieldUnit: recipe.yieldUnit,
    difficulty: recipe.difficulty,
    categoryId: recipe.categoryId,
    tagIds: recipe.tags?.map((tag) => tag.tagId) ?? [],
    sections: [...(recipe.sections ?? [])]
      .sort((left, right) => left.position - right.position)
      .map((section, sectionIndex) => ({
        title: section.title,
        position: sectionIndex,
        ingredients: [...(section.ingredients ?? [])]
          .sort((left, right) => left.position - right.position)
          .map((ingredient, ingredientIndex) => ({
            displayText: ingredient.displayText,
            quantity: ingredient.quantity ?? "",
            quantityInGrams: ingredient.quantityInGrams,
            unit: ingredient.unit,
            notes: ingredient.notes ?? "",
            position: ingredientIndex,
            ingredientId: ingredient.ingredientId,
          })),
        steps: [...(section.steps ?? [])]
          .sort((left, right) => left.position - right.position)
          .map((step, stepIndex) => ({
            id: step.id,
            description: step.description,
            position: stepIndex,
            imageUrl: step.imageUrl,
            imagePublicId: step.imagePublicId,
          })),
      })),
  };
}
