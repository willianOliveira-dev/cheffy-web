"use client";

import { FallbackImage as Image } from "@/components/shared/fallback-image";
import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowDown, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import type { Ingredient } from "@/services/api/generated/model";
import { getIngredients } from "@/services/api/generated/ingredients/ingredients";
import { cn } from "@/utils/class-names";
import { SearchSubmitField } from "@/components/shared/search-submit-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { INGREDIENTS_PAGE_SIZE } from "@/constants/recipe-form";
import { mergeIngredients } from "@/utils/recipes/recipe-form";

type IngredientPickerSearchValues = {
  search: string;
};

type IngredientPickerProps = {
  ingredients: Ingredient[];
  isLoading: boolean;
  isError: boolean;
  selectedId: string;
  onSelect: (ingredient: Ingredient) => void;
};

export function IngredientPicker({
  ingredients,
  isLoading,
  isError,
  selectedId,
  onSelect,
}: IngredientPickerProps) {
  const [open, setOpen] = useState(false);
  const [submittedSearch, setSubmittedSearch] = useState("");
  const searchForm = useForm<IngredientPickerSearchValues>({
    defaultValues: {
      search: "",
    },
  });
  const ingredientsPagesQuery = useInfiniteQuery({
    queryKey: ["ingredient-picker", submittedSearch],
    queryFn: ({ pageParam, signal }) =>
      getIngredients(
        {
          limit: INGREDIENTS_PAGE_SIZE,
          page: pageParam,
          search: submittedSearch || undefined,
        },
        undefined,
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });
  const pagedIngredients = useMemo(
    () => ingredientsPagesQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [ingredientsPagesQuery.data?.pages],
  );
  const availableIngredients = useMemo(
    () => mergeIngredients(ingredients, pagedIngredients),
    [ingredients, pagedIngredients],
  );
  const listedIngredients = submittedSearch ? pagedIngredients : availableIngredients;
  const selectedIngredient = availableIngredients.find((ingredient) => ingredient.id === selectedId);

  const isLoadingList = (isLoading || ingredientsPagesQuery.isFetching) && listedIngredients.length === 0;
  const isErrorList = isError || ingredientsPagesQuery.isError;
  const canLoadMore = Boolean(ingredientsPagesQuery.hasNextPage && !isErrorList);

  function handleLoadMore() {
    void ingredientsPagesQuery.fetchNextPage();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      searchForm.reset({ search: "" });
      setSubmittedSearch("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="outline"
        className="h-auto min-h-11 w-full justify-start gap-3 px-3 py-2 text-left"
        onClick={() => setOpen(true)}
      >
        <IngredientThumb ingredient={selectedIngredient} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">
            {selectedIngredient?.name ?? "Escolha um ingrediente"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {selectedIngredient?.category ?? "Busque pelo nome ou pela categoria"}
          </span>
        </span>
      </Button>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl">Escolha um ingrediente</DialogTitle>
          <DialogDescription>Busque pelo nome e selecione o item usado na receita.</DialogDescription>
        </DialogHeader>

        <SearchSubmitField
          control={searchForm.control}
          name="search"
          placeholder="Buscar ingrediente"
          ariaLabel="Buscar ingrediente"
          inputClassName="h-10 rounded-full"
          onSubmit={() => {
            const nextSearch = searchForm.getValues("search").trim();
            searchForm.setValue("search", nextSearch, { shouldDirty: false });
            setSubmittedSearch(nextSearch);
          }}
        />

        <ScrollArea className="h-[22rem] pr-3">
          <div className="grid gap-2">
            {isLoadingList ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Carregando ingredientes...
              </div>
            ) : isErrorList ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Não conseguimos carregar os ingredientes agora.
              </div>
            ) : (
              listedIngredients.map((ingredient) => (
                <button
                  key={ingredient.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-2 text-left transition hover:bg-muted/60",
                    ingredient.id === selectedId && "border-primary bg-primary/5",
                  )}
                  onClick={() => {
                    onSelect(ingredient);
                    setOpen(false);
                    searchForm.reset({ search: "" });
                    setSubmittedSearch("");
                  }}
                >
                  <IngredientThumb ingredient={ingredient} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{ingredient.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {ingredient.category ?? "Sem categoria"}
                    </span>
                  </span>
                </button>
              ))
            )}

            {!isLoadingList && !isErrorList && listedIngredients.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nenhum ingrediente encontrado.
              </div>
            )}

            {canLoadMore && (
              <Button
                type="button"
                variant="outline"
                className="mt-1 w-full"
                disabled={ingredientsPagesQuery.isFetchingNextPage}
                onClick={handleLoadMore}
              >
                {ingredientsPagesQuery.isFetchingNextPage ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <ArrowDown data-icon="inline-start" />
                )}
                {ingredientsPagesQuery.isFetchingNextPage ? "Carregando..." : "Carregar mais"}
              </Button>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function IngredientThumb({ ingredient }: { ingredient?: Ingredient }) {
  if (ingredient?.imageUrl) {
    return (
      <Image
        src={ingredient.imageUrl}
        alt={ingredient.name}
        width={44}
        height={44}
        className="size-11 shrink-0 rounded-md object-cover"
      />
    );
  }

  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground">
      {ingredient?.name?.charAt(0).toUpperCase() ?? "?"}
    </span>
  );
}
