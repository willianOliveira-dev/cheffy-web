import type { CreateMyRecipeBody, CreateMyRecipeBodySectionsItemIngredientsItemUnit, Ingredient } from "@/api/generated/model";
import { WEIGHT_UNIT_TO_GRAMS } from "./recipe-form-constants";
import type { RecipeFormValues } from "./recipe-form-types";

export function mergeIngredients(...ingredientLists: Ingredient[][]) {
  const ingredientMap = new Map<string, Ingredient>();

  for (const ingredientList of ingredientLists) {
    for (const ingredient of ingredientList) {
      ingredientMap.set(ingredient.id, ingredient);
    }
  }

  return Array.from(ingredientMap.values());
}

export function isWeightMeasurementUnit(unit?: CreateMyRecipeBodySectionsItemIngredientsItemUnit) {
  return Boolean(unit && WEIGHT_UNIT_TO_GRAMS[unit]);
}

export function convertQuantityToGrams(
  quantity: string | undefined,
  unit?: CreateMyRecipeBodySectionsItemIngredientsItemUnit,
) {
  const multiplier = unit ? WEIGHT_UNIT_TO_GRAMS[unit] : undefined;
  if (!multiplier) return undefined;

  const amount = parseQuantityAmount(quantity);
  if (!amount) return undefined;

  return roundIngredientWeight(amount * multiplier);
}

export function formatIngredientWeight(value: number) {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(value)} g`;
}

export function getIngredientQuantityInGrams(
  ingredient: RecipeFormValues["sections"][number]["ingredients"][number],
) {
  return convertQuantityToGrams(ingredient.quantity, ingredient.unit) ?? Number(ingredient.quantityInGrams);
}

export function buildRecipePayload(values: RecipeFormValues): CreateMyRecipeBody {
  if (!values.title.trim()) throw new Error("Dê um nome para a receita antes de salvar.");
  if (!values.description.trim()) throw new Error("Escreva um resumo curto para a receita.");
  if (!values.categoryId) throw new Error("Escolha uma categoria para organizar a receita.");
  const prepTime = Number(values.prepTime);
  const cookTime = Number(values.cookTime);
  const yieldAmount = Number(values.yieldAmount);

  if (!Number.isFinite(prepTime) || !Number.isFinite(cookTime) || prepTime <= 0 || cookTime <= 0) {
    throw new Error("Informe o tempo de preparo e o tempo de cozimento.");
  }
  if (!Number.isFinite(yieldAmount) || yieldAmount <= 0) throw new Error("Informe o rendimento da receita.");

  const sections = values.sections.map((section, sectionIndex) => {
    if (!section.title.trim()) throw new Error(`Dê um nome para a etapa ${sectionIndex + 1}.`);

    const ingredients = section.ingredients.map((ingredient, ingredientIndex) => {
      if (!ingredient.ingredientId) {
        throw new Error(`Escolha o ingrediente ${ingredientIndex + 1} da etapa ${sectionIndex + 1}.`);
      }
      if (!ingredient.displayText.trim()) {
        throw new Error(`Descreva como o ingrediente ${ingredientIndex + 1} aparece na receita.`);
      }
      const quantityInGrams = getIngredientQuantityInGrams(ingredient);
      if (!Number.isFinite(quantityInGrams) || quantityInGrams <= 0) {
        const message = isWeightMeasurementUnit(ingredient.unit)
          ? `Informe a quantidade do ingrediente ${ingredientIndex + 1}.`
          : `Informe o peso aproximado do ingrediente ${ingredientIndex + 1}.`;
        throw new Error(message);
      }

      return {
        displayText: ingredient.displayText.trim(),
        quantity: ingredient.quantity.trim() || undefined,
        quantityInGrams,
        unit: ingredient.unit,
        notes: ingredient.notes.trim() || undefined,
        position: ingredientIndex,
        ingredientId: ingredient.ingredientId,
      };
    });

    const steps = section.steps.map((step, stepIndex) => {
      if (!step.description.trim()) {
        throw new Error(`Explique o passo ${stepIndex + 1} da etapa ${sectionIndex + 1}.`);
      }

      return {
        description: step.description.trim(),
        position: stepIndex,
        imageUrl: step.imageUrl || undefined,
        imagePublicId: step.imagePublicId || undefined,
      };
    });

    return {
      title: section.title.trim(),
      position: sectionIndex,
      ingredients,
      steps,
    };
  });

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    imageUrl: values.imageUrl || undefined,
    imagePublicId: values.imagePublicId || undefined,
    prepTime,
    cookTime,
    yieldAmount,
    yieldUnit: values.yieldUnit,
    difficulty: values.difficulty,
    categoryId: values.categoryId,
    tagIds: values.tagIds,
    sections,
  };
}

function parseQuantityAmount(quantity: string | undefined) {
  const normalizedQuantity = quantity?.trim().replace(",", ".");
  if (!normalizedQuantity) return undefined;

  const mixedFraction = normalizedQuantity.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (mixedFraction) {
    const whole = Number(mixedFraction[1]);
    const numerator = Number(mixedFraction[2]);
    const denominator = Number(mixedFraction[3]);
    if (denominator > 0) return whole + numerator / denominator;
  }

  const fraction = normalizedQuantity.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    if (denominator > 0) return numerator / denominator;
  }

  const numericMatch = normalizedQuantity.match(/^\d+(?:\.\d+)?/);
  const amount = Number(numericMatch?.[0]);
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

function roundIngredientWeight(value: number) {
  return Math.round(value * 1000) / 1000;
}
