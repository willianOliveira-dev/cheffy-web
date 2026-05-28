"use client";

import Link from "next/link";
import { useState } from "react";
import { useGetCategoryBySlug } from "@/api/generated/categories/categories";
import { GetRecipesOrderBy } from "@/api/generated/model";
import { useGetRecipes } from "@/api/generated/recipes/recipes";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryHero } from "./category-hero";
import { CategoryEmptyState, CategoryNotFoundState } from "./category-empty-state";
import { RecipeCard } from "@/components/shared/recipe-card";
import { RecipeCardSkeleton } from "@/components/shared/recipe-card-skeleton";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type CategoryPageClientProps = {
  slug: string;
};

const PAGE_SIZE = 12;


export function CategoryPageClient({ slug }: CategoryPageClientProps) {
  const [page, setPage] = useState(1);
  const {
    data: category,
    isLoading: isLoadingCategory,
    isError: isCategoryError,
  } = useGetCategoryBySlug(slug);

  const {
    data: recipesData,
    isLoading: isLoadingRecipes,
    isError: isRecipesError,
  } = useGetRecipes(
    {
      categoryId: category?.id,
      orderBy: GetRecipesOrderBy.newest,
      page,
      limit: PAGE_SIZE,
    },
    {
      query: {
        enabled: Boolean(category?.id),
      },
    },
  );

  const recipes = recipesData?.items ?? [];
  const meta = recipesData?.meta;
  const isLoading = isLoadingCategory || isLoadingRecipes;

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isCategoryError) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <CategoryNotFoundState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <CategoryHero
          category={category ?? null}
          isLoadingCategory={isLoadingCategory}
        />

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight">
                Receitas {category?.name ? `de ${category.name}` : "da categoria"}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {isLoading
                  ? "Buscando receitas..."
                  : `${meta?.totalItems ?? 0} receitas encontradas nessa categoria.`}
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit rounded-full">
              <Link href="/receitas">Ver todas as receitas</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          ) : isRecipesError ? (
            <div className="rounded-xl border border-dashed py-24 text-center text-muted-foreground">
              Ocorreu um erro ao carregar as receitas dessa categoria. Tente novamente.
            </div>
          ) : recipes.length === 0 ? (
            <CategoryEmptyState />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        </section>
      </main>
    </div>
  );
}
