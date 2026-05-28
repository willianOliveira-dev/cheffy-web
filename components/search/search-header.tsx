import { Search, SlidersHorizontal } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { GetRecipesOrderBy } from "@/api/generated/model";
import { DebouncedSearchInput } from "@/components/shared/debounced-input";
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
import { SearchFilters } from "./search-filters";

type SearchHeaderProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  isInitialLoading: boolean;
  isUpdating: boolean;
  totalItems: number;
};

export function SearchHeader({
  form,
  isInitialLoading,
  isUpdating,
  totalItems,
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
            <SheetContent side="left" className="h-dvh w-[300px] overflow-hidden sm:w-[400px]">
              <SheetHeader className="shrink-0">
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
                <SearchFilters />
              </div>
            </SheetContent>
          </Sheet>

          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="w-full flex-1">
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <DebouncedSearchInput
                      placeholder="Buscar receitas pelo nome..."
                      className="w-full bg-background pl-9"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
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
