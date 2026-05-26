"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronRight, icons, Search } from "lucide-react";
import { createElement, useState } from "react";
import { useGetCategoryBySlug } from "@/api/generated/categories/categories";
import { GetRecipesOrderBy } from "@/api/generated/model";
import { useGetRecipes } from "@/api/generated/recipes/recipes";
import { SiteHeader } from "@/components/layout/site-header";
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

function getCategoryIcon(iconKey?: string) {
  const iconName = iconKey
    ? iconKey
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("")
    : "Utensils";

  return icons[iconName as keyof typeof icons] || icons.Utensils;
}

function CategoryIcon({
  iconKey,
  className,
}: {
  iconKey?: string;
  className?: string;
}) {
  const IconComponent = getCategoryIcon(iconKey);

  return createElement(IconComponent, { className });
}

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isCategoryError) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Search className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Categoria não encontrada</h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Não foi possível encontrar essa categoria. Volte para explorar todas as receitas disponíveis.
          </p>
          <Button asChild className="mt-8 rounded-full">
            <Link href="/receitas">Explorar receitas</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="relative flex min-h-[22rem] items-center overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 z-0">
            <Image
              src={category?.imageUrl || "/images/search-hero.png"}
              alt={category?.name || "Categoria de receitas"}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/55 to-black/35" />
          </div>

          <div className="container relative z-10 mx-auto px-4 py-16 text-white">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mb-8 rounded-full border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Voltar para home
              </Link>
            </Button>

            <div className="flex max-w-3xl flex-col gap-5">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/75">
                  <Link href="/" className="transition-colors hover:text-white">
                    Home
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <span>Categoria</span>
                </div>
                <h1 className="flex flex-wrap items-center gap-4 font-heading text-4xl font-bold tracking-tight md:text-6xl">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md md:h-14 md:w-14">
                    <CategoryIcon iconKey={category?.iconKey} className="h-6 w-6 md:h-7 md:w-7" />
                  </span>
                  {isLoadingCategory ? "Carregando categoria..." : category?.name}
                </h1>
                {category?.description && (
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

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
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-24 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-xl font-bold">Nenhuma receita encontrada</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                Ainda não existem receitas publicadas nessa categoria.
              </p>
            </div>
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
