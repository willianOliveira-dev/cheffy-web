"use client";

import { useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, SlidersHorizontal } from "lucide-react";
import { useGetRecipes } from "@/api/generated/recipes/recipes";
import { GetRecipesDifficulty, GetRecipesOrderBy } from "@/api/generated/model";
import { SearchFormValues, searchSchema } from "@/lib/schemas/search";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { SearchFilters } from "./search-filters";
import { RecipeCard } from "@/components/shared/recipe-card";
import { RecipeCardSkeleton } from "@/components/shared/recipe-card-skeleton";

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

  const watchedValues = form.watch();

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && name !== "page") {
        form.setValue("page", 1, { shouldValidate: true });
      }

      startTransition(() => {
        const currentValues = form.getValues();
        const params = new URLSearchParams();

        if (currentValues.search) params.set("search", currentValues.search);
        if (currentValues.categoryId) params.set("categoryId", currentValues.categoryId);
        if (currentValues.tagId) params.set("tagId", currentValues.tagId);
        if (currentValues.difficulty) params.set("difficulty", currentValues.difficulty);
        if (currentValues.maxTotalTime) params.set("maxTotalTime", currentValues.maxTotalTime.toString());
        if (currentValues.orderBy && currentValues.orderBy !== GetRecipesOrderBy.newest) params.set("orderBy", currentValues.orderBy);
        if (currentValues.page && currentValues.page > 1) params.set("page", currentValues.page.toString());

        router.replace(`?${params.toString()}`, { scroll: false });
      });
    });
    return () => subscription.unsubscribe();
  }, [form, router]);

  const { data, isLoading, isError } = useGetRecipes({
    search: watchedValues.search || undefined,
    categoryId: watchedValues.categoryId || undefined,
    tagId: watchedValues.tagId || undefined,
    difficulty: watchedValues.difficulty || undefined,
    maxTotalTime: watchedValues.maxTotalTime || undefined,
    orderBy: watchedValues.orderBy || GetRecipesOrderBy.newest,
    page: watchedValues.page || 1,
    limit: 12,
  });

  const recipes = data?.items || [];
  const meta = data?.meta;

  const handlePageChange = (newPage: number) => {
    form.setValue("page", newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Form {...form}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">

          <aside className="hidden md:block w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold tracking-tight mb-2">Filtros</h2>
                <p className="text-sm text-muted-foreground">Refine sua busca para encontrar a receita perfeita.</p>
              </div>
              <SearchFilters />
            </div>
          </aside>

          <main className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
              <div className="flex flex-1 w-full gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden shrink-0">
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
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar receitas pelo nome..."
                            className="pl-9 bg-background w-full"
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
                  <FormItem className="w-full sm:w-auto shrink-0">
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full sm:w-[180px] bg-background">
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

            <div>
              <div className="mb-4">
                <h3 className="text-muted-foreground font-medium">
                  {isLoading || isPending ? (
                    "Buscando receitas..."
                  ) : (
                    <>{meta?.totalItems || 0} receitas encontradas</>
                  )}
                </h3>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <RecipeCardSkeleton key={i} />
                  ))}
                </div>
              ) : isError ? (
                <div className="py-24 text-center text-muted-foreground border rounded-xl border-dashed">
                  Ocorreu um erro ao carregar as receitas. Tente novamente.
                </div>
              ) : recipes.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center border rounded-xl border-dashed bg-muted/20">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-2">Nenhuma receita encontrada</h3>
                  <p className="text-muted-foreground max-w-md">
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
                        page: 1
                      });
                    }}
                  >
                    Limpar todos os filtros
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
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
                            onClick={(e) => {
                              e.preventDefault();
                              if (meta.hasPrevious) handlePageChange(meta.page - 1);
                            }}
                            className={!meta.hasPrevious ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>

                        {Array.from({ length: meta.totalPages }).map((_, i) => {
                          const pageNumber = i + 1;
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
                                  onClick={(e) => {
                                    e.preventDefault();
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
                            onClick={(e) => {
                              e.preventDefault();
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
            </div>
          </main>
        </div>
      </div>
    </Form>
  );
}
