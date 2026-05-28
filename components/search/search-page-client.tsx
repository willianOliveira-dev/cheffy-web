"use client";

import { useEffect, useMemo, useRef, useTransition } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, SlidersHorizontal } from "lucide-react";
import { useGetRecipes } from "@/api/generated/recipes/recipes";
import { GetRecipesDifficulty, GetRecipesOrderBy } from "@/api/generated/model";
import { SearchFormValues, searchSchema } from "@/lib/schemas/search";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { SearchFilters } from "./search-filters";
import { RecipeCard } from "@/components/shared/recipe-card";
import { RecipeCardSkeleton } from "@/components/shared/recipe-card-skeleton";

const SEARCH_PAGE_SIZE = 12;

export function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const defaultValues: SearchFormValues = {
    search: searchParams.get("search") || "",
    categoryId: searchParams.get("categoryId") || "",
    tagId: searchParams.get("tagId") || "",
    difficulty: (searchParams.get("difficulty") as GetRecipesDifficulty) || undefined,
    maxTotalTime: searchParams.get("maxTotalTime") ? Number(searchParams.get("maxTotalTime")) : undefined,
    orderBy: (searchParams.get("orderBy") as GetRecipesOrderBy) || GetRecipesOrderBy.newest,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
  };

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues,
    mode: "onChange",
  });

  const searchValue = useWatch({ control: form.control, name: "search" }) || "";
  const categoryId = useWatch({ control: form.control, name: "categoryId" }) || "";
  const tagId = useWatch({ control: form.control, name: "tagId" }) || "";
  const difficulty = useWatch({ control: form.control, name: "difficulty" });
  const maxTotalTime = useWatch({ control: form.control, name: "maxTotalTime" });
  const orderBy = useWatch({ control: form.control, name: "orderBy" }) || GetRecipesOrderBy.newest;
  const page = useWatch({ control: form.control, name: "page" }) || 1;

  const debouncedSearch = useDebouncedValue(searchValue.trim(), 350);
  const debouncedMaxTotalTime = useDebouncedValue(maxTotalTime, 250);

  const filterResetKey = useMemo(
    () => [searchValue, categoryId, tagId, difficulty ?? "", maxTotalTime ?? "", orderBy].join("|"),
    [categoryId, difficulty, maxTotalTime, orderBy, searchValue, tagId],
  );
  const isFirstFilterSync = useRef(true);

  useEffect(() => {
    if (isFirstFilterSync.current) {
      isFirstFilterSync.current = false;
      return;
    }

    if (form.getValues("page") !== 1) {
      form.setValue("page", 1, { shouldValidate: false });
    }
  }, [filterResetKey, form]);

  const recipeParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      categoryId: categoryId || undefined,
      tagId: tagId || undefined,
      difficulty: difficulty || undefined,
      maxTotalTime: debouncedMaxTotalTime || undefined,
      orderBy,
      page,
      limit: SEARCH_PAGE_SIZE,
    }),
    [categoryId, debouncedMaxTotalTime, debouncedSearch, difficulty, orderBy, page, tagId],
  );

  useEffect(() => {
    startTransition(() => {
      const params = new URLSearchParams();

      if (recipeParams.search) params.set("search", recipeParams.search);
      if (recipeParams.categoryId) params.set("categoryId", recipeParams.categoryId);
      if (recipeParams.tagId) params.set("tagId", recipeParams.tagId);
      if (recipeParams.difficulty) params.set("difficulty", recipeParams.difficulty);
      if (recipeParams.maxTotalTime) params.set("maxTotalTime", recipeParams.maxTotalTime.toString());
      if (recipeParams.orderBy !== GetRecipesOrderBy.newest) params.set("orderBy", recipeParams.orderBy);
      if (recipeParams.page > 1) params.set("page", recipeParams.page.toString());

      const queryString = params.toString();
      router.replace(queryString ? `?${queryString}` : "/receitas", { scroll: false });
    });
  }, [recipeParams, router]);

  const { data, isLoading, isFetching, isError } = useGetRecipes(recipeParams, {
    query: {
      placeholderData: keepPreviousData,
      staleTime: 30 * 1000,
    },
  });

  const recipes = data?.items || [];
  const meta = data?.meta;
  const isInitialLoading = isLoading && !data;
  const isUpdating = (isFetching || isPending) && Boolean(data);

  const handlePageChange = (newPage: number) => {
    form.setValue("page", newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Form {...form}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="hidden w-72 shrink-0 md:block">
            <div className="sticky top-24 flex flex-col gap-6">
              <div>
                <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight">Filtros</h2>
                <p className="text-sm text-muted-foreground">Refine sua busca para encontrar a receita perfeita.</p>
              </div>
              <SearchFilters />
            </div>
          </aside>

          <main className="flex-1">
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
                          <Input
                            placeholder="Buscar receitas pelo nome..."
                            className="w-full bg-background pl-9"
                            {...field}
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
                  <>{meta?.totalItems || 0} receitas encontradas</>
                )}
              </h3>
              {isUpdating && (
                <span className="text-xs font-medium text-muted-foreground">Atualizando resultados...</span>
              )}
            </div>

            {isInitialLoading ? (
              <RecipeGridSkeleton />
            ) : isError ? (
              <div className="rounded-xl border border-dashed py-24 text-center text-muted-foreground">
                Ocorreu um erro ao carregar as receitas. Tente novamente.
              </div>
            ) : recipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-24 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 font-heading text-xl font-bold">Nenhuma receita encontrada</h3>
                <p className="max-w-md text-muted-foreground">
                  Não encontramos nenhuma receita com os filtros selecionados. Tente usar termos mais genéricos ou remover alguns filtros.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    form.reset({
                      search: "",
                      categoryId: "",
                      tagId: "",
                      difficulty: undefined,
                      maxTotalTime: undefined,
                      orderBy: GetRecipesOrderBy.newest,
                      page: 1,
                    });
                  }}
                >
                  Limpar todos os filtros
                </Button>
              </div>
            ) : (
              <div className={cn("flex flex-col gap-8 transition-opacity", isUpdating && "opacity-70")}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recipes.map((recipe) => (
                    <div key={recipe.id} className="h-full">
                      <RecipeCard recipe={recipe} showViews />
                    </div>
                  ))}
                </div>

                {meta && meta.totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          text="Anterior"
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();
                            if (meta.hasPrevious) handlePageChange(meta.page - 1);
                          }}
                          className={!meta.hasPrevious ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {Array.from({ length: meta.totalPages }).map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === meta.totalPages ||
                          (pageNumber >= meta.page - 1 && pageNumber <= meta.page + 1)
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                href="#"
                                isActive={pageNumber === meta.page}
                                onClick={(event) => {
                                  event.preventDefault();
                                  handlePageChange(pageNumber);
                                }}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        if (
                          (pageNumber === 2 && meta.page > 3) ||
                          (pageNumber === meta.totalPages - 1 && meta.page < meta.totalPages - 2)
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <span className="px-4 py-2 text-muted-foreground">...</span>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          text="Próximo"
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();
                            if (meta.hasNext) handlePageChange(meta.page + 1);
                          }}
                          className={!meta.hasNext ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </Form>
  );
}

function RecipeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SEARCH_PAGE_SIZE }).map((_, index) => (
        <RecipeCardSkeleton key={index} />
      ))}
    </div>
  );
}
