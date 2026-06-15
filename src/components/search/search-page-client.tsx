"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetRecipes } from "@/services/api/generated/recipes/recipes";
import { GetRecipesDifficulty, GetRecipesOrderBy } from "@/services/api/generated/model";
import { SearchFormValues, searchSchema } from "@/lib/schemas/search";
import { cn } from "@/lib/utils";

import { Form } from "@/components/ui/form";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { SearchFilters } from "./search-filters";
import { SearchHeader } from "./search-header";
import { SearchEmptyState } from "./search-empty-state";
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

  const categoryId = useWatch({ control: form.control, name: "categoryId" }) || "";
  const tagId = useWatch({ control: form.control, name: "tagId" }) || "";
  const difficulty = useWatch({ control: form.control, name: "difficulty" });
  const maxTotalTime = useWatch({ control: form.control, name: "maxTotalTime" });
  const orderBy = useWatch({ control: form.control, name: "orderBy" }) || GetRecipesOrderBy.newest;
  const page = useWatch({ control: form.control, name: "page" }) || 1;
  const [submittedSearch, setSubmittedSearch] = useState((defaultValues.search ?? "").trim());

  const filterResetKey = useMemo(
    () => [categoryId, tagId, difficulty ?? "", maxTotalTime ?? "", orderBy].join("|"),
    [categoryId, difficulty, maxTotalTime, orderBy, tagId],
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
      search: submittedSearch || undefined,
      categoryId: categoryId || undefined,
      tagId: tagId || undefined,
      difficulty: difficulty || undefined,
      maxTotalTime: maxTotalTime || undefined,
      orderBy,
      page,
      limit: SEARCH_PAGE_SIZE,
    }),
    [categoryId, difficulty, maxTotalTime, orderBy, page, submittedSearch, tagId],
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
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
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

  const handleSearchSubmit = () => {
    setSubmittedSearch((form.getValues("search") || "").trim());
    if (form.getValues("page") !== 1) {
      form.setValue("page", 1, { shouldValidate: false });
    }
  };

  return (
    <Form {...form}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="hidden w-72 shrink-0 md:block">
            <div className="sticky top-6 flex max-h-[calc(100dvh-2.5rem)] flex-col gap-6 overflow-y-auto pr-2">
              <div>
                <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight">Filtros</h2>
                <p className="text-sm text-muted-foreground">Refine sua busca para encontrar a receita perfeita.</p>
              </div>
              <SearchFilters />
            </div>
          </aside>

          <main className="flex-1">
            <SearchHeader
              form={form}
              isInitialLoading={isInitialLoading}
              isUpdating={isUpdating}
              totalItems={meta?.totalItems || 0}
              onSearchSubmit={handleSearchSubmit}
            />

            {isInitialLoading ? (
              <RecipeGridSkeleton />
            ) : isError ? (
              <div className="rounded-xl border border-dashed py-24 text-center text-muted-foreground">
                Ocorreu um erro ao carregar as receitas. Tente novamente.
              </div>
            ) : recipes.length === 0 ? (
              <SearchEmptyState
                onClearFilters={() => {
                  form.reset({
                    search: "",
                    categoryId: "",
                    tagId: "",
                    difficulty: undefined,
                    maxTotalTime: undefined,
                    orderBy: GetRecipesOrderBy.newest,
                    page: 1,
                  });
                  setSubmittedSearch("");
                }}
              />
            ) : (
              <div className={cn("flex flex-col gap-8 transition-opacity", isUpdating && "opacity-70")}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recipes.map((recipe) => (
                    <div key={recipe.id} className="h-full">
                      <RecipeCard recipe={recipe} showViews />
                    </div>
                  ))}
                </div>

                <PaginationControls meta={meta} onPageChange={handlePageChange} />
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
