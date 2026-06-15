"use client";

import type { UseFormReturn } from "react-hook-form";
import { GetMyRecipesOrderBy } from "@/services/api/generated/model";
import type { MyRecipesFilters } from "@/lib/my-recipes/my-recipes-list-types";
import { SearchSubmitField } from "@/components/shared/search-submit-field";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MyRecipesToolbarProps = {
  form: UseFormReturn<MyRecipesFilters>;
  onSearchSubmit: () => void;
  onFilterChange: () => void;
};

export function MyRecipesToolbar({ form, onSearchSubmit, onFilterChange }: MyRecipesToolbarProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_10rem_10rem] md:w-2xl">
      <SearchSubmitField
        control={form.control}
        name="search"
        placeholder="Buscar nas minhas receitas"
        ariaLabel="Pesquisar minhas receitas"
        inputClassName="h-10 rounded-full"
        onSubmit={onSearchSubmit}
      />

      <FormField
        control={form.control}
        name="isPublished"
        render={({ field }) => (
          <FormItem>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                onFilterChange();
              }}
            >
              <FormControl>
                <SelectTrigger className="h-10 w-full rounded-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="draft">Rascunhos</SelectItem>
                  <SelectItem value="published">Publicadas</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="orderBy"
        render={({ field }) => (
          <FormItem>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                onFilterChange();
              }}
            >
              <FormControl>
                <SelectTrigger className="h-10 w-full rounded-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={GetMyRecipesOrderBy.newest}>Mais recentes</SelectItem>
                  <SelectItem value={GetMyRecipesOrderBy.oldest}>Mais antigas</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </div>
  );
}
