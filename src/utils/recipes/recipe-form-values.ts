import type { Recipe } from "@/services/api/generated/model";
import type {
  RecipeFormIngredient,
  RecipeFormSection,
  RecipeFormStep,
  RecipeFormValues,
} from "@/types/recipe-form";

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
    imageUrl: getRecipeImageUrl(recipe),
    imagePublicId: getRecipeImagePublicId(recipe),
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    yieldAmount: recipe.yieldAmount,
    yieldUnit: recipe.yieldUnit,
    difficulty: recipe.difficulty,
    categoryId: recipe.categoryId,
    tagIds: recipe.tags?.map((tag) => tag.tagId ?? ("id" in tag ? tag.id : "")).filter(Boolean) ?? [],
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

function getRecipeImageUrl(recipe: Recipe) {
  const payload = recipe as unknown as {
    imageUrl?: string | null;
    image_url?: string | null;
    secureUrl?: string | null;
    secure_url?: string | null;
  };

  return payload.imageUrl ?? payload.image_url ?? payload.secureUrl ?? payload.secure_url ?? null;
}

function getRecipeImagePublicId(recipe: Recipe) {
  const payload = recipe as unknown as {
    imagePublicId?: string | null;
    image_public_id?: string | null;
    publicId?: string | null;
    public_id?: string | null;
  };

  return payload.imagePublicId ?? payload.image_public_id ?? payload.publicId ?? payload.public_id ?? undefined;
}
