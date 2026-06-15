import { SlidersHorizontal } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { GetRecipesOrderBy } from "@/services/api/generated/model";
import { SearchSubmitField } from "@/components/shared/search-submit-field";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { SearchFormValues } from "@/lib/schemas/search";
import { SearchFilters } from "./search-filters";

type SearchHeaderProps = {
  form: UseFormReturn<SearchFormValues>;
  isInitialLoading: boolean;
  isUpdating: boolean;
  totalItems: number;
  onSearchSubmit: () => void;
};

export function SearchHeader({
  form,
  isInitialLoading,
  isUpdating,
  totalItems,
  onSearchSubmit,
}: SearchHeaderProps) {
  return (
    <>
      <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row">
        <div className="flex w-full flex-1 gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex h-dvh w-75 flex-col overflow-hidden sm:w-100">
              <SheetHeader className="shrink-0">
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
                <SearchFilters />
              </div>
            </SheetContent>
          </Sheet>

          <SearchSubmitField
            control={form.control}
            name="search"
            placeholder="Buscar receitas pelo nome..."
            ariaLabel="Pesquisar receitas"
            inputClassName="bg-background"
            onSubmit={onSearchSubmit}
          />
        </div>

        <FormField
          control={form.control}
          name="orderBy"
          render={({ field }) => (
            <FormItem className="w-full shrink-0 sm:w-auto">
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full bg-background sm:w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GetRecipesOrderBy.newest}>Mais recentes</SelectItem>
                    <SelectItem value={GetRecipesOrderBy.oldest}>Mais antigas</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-medium text-muted-foreground">
          {isInitialLoading ? (
            "Buscando receitas..."
          ) : (
            <>{totalItems} receitas encontradas</>
          )}
        </h3>
        {isUpdating && (
          <span className="text-xs font-medium text-muted-foreground">Atualizando resultados...</span>
        )}
      </div>
    </>
  );
}
