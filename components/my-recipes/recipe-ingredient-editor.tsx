"use client";

import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import {
  CreateMyRecipeBodySectionsItemIngredientsItemUnit,
  type Ingredient,
} from "@/api/generated/model";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IngredientPicker } from "./ingredient-picker";
import { RecipeItemMoveControls } from "./recipe-item-move-controls";
import { UNIT_LABELS } from "@/lib/my-recipes/recipe-form-constants";
import {
  convertQuantityToGrams,
  formatIngredientWeight,
  isWeightMeasurementUnit,
} from "@/lib/my-recipes/recipe-form-helpers";
import type { RecipeFormValues } from "@/lib/my-recipes/recipe-form-types";

type RecipeIngredientEditorProps = {
  form: UseFormReturn<RecipeFormValues>;
  sectionIndex: number;
  ingredientIndex: number;
  ingredientsCount: number;
  ingredients: Ingredient[];
  isLoadingIngredients: boolean;
  isIngredientsError: boolean;
  onRememberIngredient: (ingredient: Ingredient) => void;
  onMoveIngredient: (direction: -1 | 1) => void;
  onRemoveIngredient: () => void;
};

export function RecipeIngredientEditor({
  form,
  sectionIndex,
  ingredientIndex,
  ingredientsCount,
  ingredients,
  isLoadingIngredients,
  isIngredientsError,
  onRememberIngredient,
  onMoveIngredient,
  onRemoveIngredient,
}: RecipeIngredientEditorProps) {
  const quantityPath = `sections.${sectionIndex}.ingredients.${ingredientIndex}.quantity` as const;
  const unitPath = `sections.${sectionIndex}.ingredients.${ingredientIndex}.unit` as const;
  const quantityInGramsPath = `sections.${sectionIndex}.ingredients.${ingredientIndex}.quantityInGrams` as const;
  const selectedQuantity = useWatch({ control: form.control, name: quantityPath });
  const selectedUnit = useWatch({ control: form.control, name: unitPath });
  const isWeightUnit = isWeightMeasurementUnit(selectedUnit);
  const convertedQuantityInGrams = convertQuantityToGrams(selectedQuantity, selectedUnit);
  const quantityRegistration = form.register(quantityPath);
  const approximateWeightId = `ingredient-weight-${sectionIndex}-${ingredientIndex}`;

  function syncQuantityInGrams(quantity: string, unit: CreateMyRecipeBodySectionsItemIngredientsItemUnit) {
    if (!isWeightMeasurementUnit(unit)) return;

    form.setValue(quantityInGramsPath, convertQuantityToGrams(quantity, unit), {
      shouldDirty: true,
      shouldValidate: false,
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-lg bg-muted/25 p-2">
      <div className="flex min-w-0 items-start gap-2">
        <FormField
          control={form.control}
          name={`sections.${sectionIndex}.ingredients.${ingredientIndex}.ingredientId`}
          render={({ field }) => (
            <FormItem className="min-w-0 flex-1">
              <IngredientPicker
                ingredients={ingredients}
                isLoading={isLoadingIngredients}
                isError={isIngredientsError}
                selectedId={field.value}
                onSelect={(selected) => {
                  onRememberIngredient(selected);
                  field.onChange(selected.id);
                  const displayTextPath = `sections.${sectionIndex}.ingredients.${ingredientIndex}.displayText` as const;
                  if (!form.getValues(displayTextPath)) {
                    form.setValue(displayTextPath, selected.name, { shouldDirty: true });
                  }
                }}
              />
            </FormItem>
          )}
        />
        <RecipeItemMoveControls
          index={ingredientIndex}
          count={ingredientsCount}
          onMove={onMoveIngredient}
          onRemove={onRemoveIngredient}
          removeDisabled={ingredientsCount === 1}
          size="icon-xs"
        />
      </div>

      <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_5rem_8rem]">
        <Input
          className="min-w-0"
          placeholder="Ex.: 2 bananas maduras"
          {...form.register(`sections.${sectionIndex}.ingredients.${ingredientIndex}.displayText`)}
        />
        <Input
          className="min-w-0"
          placeholder="Qtd."
          {...quantityRegistration}
          onChange={(event) => {
            void quantityRegistration.onChange(event);
            syncQuantityInGrams(event.target.value, form.getValues(unitPath));
          }}
        />
        <FormField
          control={form.control}
          name={unitPath}
          render={({ field }) => (
            <FormItem>
              <Select
                value={field.value}
                onValueChange={(nextUnit: CreateMyRecipeBodySectionsItemIngredientsItemUnit) => {
                  const wasWeightUnit = isWeightMeasurementUnit(field.value);
                  field.onChange(nextUnit);

                  if (isWeightMeasurementUnit(nextUnit)) {
                    syncQuantityInGrams(form.getValues(quantityPath), nextUnit);
                    return;
                  }

                  if (wasWeightUnit) {
                    form.setValue(quantityInGramsPath, undefined, {
                      shouldDirty: true,
                      shouldValidate: false,
                    });
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(CreateMyRecipeBodySectionsItemIngredientsItemUnit).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Input
          className="min-w-0 sm:col-span-3"
          placeholder="Observação curta, se precisar"
          {...form.register(`sections.${sectionIndex}.ingredients.${ingredientIndex}.notes`)}
        />
      </div>

      {isWeightUnit ? (
        convertedQuantityInGrams ? (
          <p className="text-xs text-muted-foreground">
            Peso para nutrição: {formatIngredientWeight(convertedQuantityInGrams)}.
          </p>
        ) : null
      ) : (
        <div className="rounded-lg bg-background/70 p-2">
          <div className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:items-center">
            <div className="flex flex-col gap-1">
              <Label htmlFor={approximateWeightId}>Peso aprox. (g)</Label>
              <Input
                id={approximateWeightId}
                type="number"
                min={0.1}
                step={0.1}
                placeholder="Ex.: 80"
                {...form.register(quantityInGramsPath, {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Usado para calcular a tabela nutricional quando a medida não é em peso.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
