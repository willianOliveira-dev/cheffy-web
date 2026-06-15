"use client";

import { X } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { Category, Tag } from "@/services/api/generated/model";
import {
  CreateMyRecipeBodyDifficulty,
  CreateMyRecipeBodyYieldUnit,
} from "@/services/api/generated/model";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
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
import { DIFFICULTY_LABELS, YIELD_UNIT_LABELS } from "@/constants/recipe-form";
import type { RecipeFormValues } from "@/types/recipe-form";

type RecipeDetailsCardProps = {
  form: UseFormReturn<RecipeFormValues>;
  categories: Category[];
  selectedTags: Tag[];
  availableTags: Tag[];
  tagSelectValue?: string;
  isLoadingCatalog: boolean;
  onTagSelect: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
};

export function RecipeDetailsCard({
  form,
  categories,
  selectedTags,
  availableTags,
  tagSelectValue,
  isLoadingCatalog,
  onTagSelect,
  onRemoveTag,
}: RecipeDetailsCardProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Tempo e rendimento</CardTitle>
        <CardDescription>Informe o básico para orientar quem vai preparar.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField form={form} name="prepTime" label="Preparo (min)" min={1} />
          <NumberField form={form} name="cookTime" label="Cozimento (min)" min={1} />
          <NumberField form={form} name="yieldAmount" label="Rendimento" min={1} />

          <FormField
            control={form.control}
            name="yieldUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medida do rendimento</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {Object.values(CreateMyRecipeBodyYieldUnit).map((value) => (
                        <SelectItem key={value} value={value}>
                          {YIELD_UNIT_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dificuldade</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {Object.values(CreateMyRecipeBodyDifficulty).map((value) => (
                        <SelectItem key={value} value={value}>
                          {DIFFICULTY_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoadingCatalog}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Escolha uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Marcadores</Label>
          <Select
            value={tagSelectValue}
            onValueChange={onTagSelect}
            disabled={isLoadingCatalog || availableTags.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={availableTags.length ? "Adicionar marcador" : "Todos os marcadores foram adicionados"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {availableTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="flex min-h-9 flex-wrap gap-2">
            {selectedTags.length > 0 ? (
              selectedTags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="gap-1 rounded-full px-3 py-1">
                  {tag.name}
                  <button
                    type="button"
                    className="rounded-full text-muted-foreground transition hover:text-foreground"
                    aria-label={`Remover marcador ${tag.name}`}
                    onClick={() => onRemoveTag(tag.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Escolha um ou mais marcadores para organizar a receita.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NumberField({
  form,
  name,
  label,
  min,
}: {
  form: UseFormReturn<RecipeFormValues>;
  name: "prepTime" | "cookTime" | "yieldAmount";
  label: string;
  min: number;
}) {
  return (
    <FormItem>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type="number"
        min={min}
        {...form.register(name, { setValueAs: (value) => (value === "" ? undefined : Number(value)) })}
      />
    </FormItem>
  );
}
