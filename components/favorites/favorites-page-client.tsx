"use client";

import { useMemo, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, LogIn, Search } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useGetMyFavoriteRecipes } from "@/api/generated/users/users";
import { GetMyFavoriteRecipesOrderBy } from "@/api/generated/model";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RecipeCard } from "@/components/shared/recipe-card";
import { RecipeCardSkeleton } from "@/components/shared/recipe-card-skeleton";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";

const FAVORITES_PAGE_SIZE = 10;

type FavoriteSearchFormValues = {
  search: string;
  orderBy: GetMyFavoriteRecipesOrderBy;
  page: number;
};

export function FavoritesPageClient() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const form = useForm<FavoriteSearchFormValues>({
    defaultValues: {
      search: "",
      orderBy: GetMyFavoriteRecipesOrderBy.newest,
      page: 1,
    },
  });

  const search = useWatch({ control: form.control, name: "search" }) || "";
  const orderBy = useWatch({ control: form.control, name: "orderBy" });
  const page = useWatch({ control: form.control, name: "page" }) || 1;
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  const favoriteParams = useMemo(
    () => ({
      page,
      limit: FAVORITES_PAGE_SIZE,
      search: debouncedSearch || undefined,
      orderBy,
    }),
    [debouncedSearch, orderBy, page],
  );

  const {
    data: favorites,
    isLoading,
    isFetching,
    isError,
  } = useGetMyFavoriteRecipes(
    favoriteParams,
    {
      query: {
        enabled: Boolean(session?.user),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
      },
    },
  );

  const recipes = favorites?.items ?? [];
  const meta = favorites?.meta;
  const isInitialLoading = isLoading && !favorites;
  const isUpdating = isFetching && Boolean(favorites);

  const handlePageChange = (nextPage: number) => {
    form.setValue("page", nextPage, { shouldValidate: false });
    scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetPage = () => {
    if (form.getValues("page") !== 1) {
      form.setValue("page", 1, { shouldValidate: false });
    }
  };

  return (
    <Form {...form}>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />

      <main className="flex-1">
        <section className="relative flex min-h-96 items-center overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/favorites-image.jpg"
              alt="Receitas salvas em uma mesa"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/25" />
          </div>

          <div className="container relative z-10 mx-auto px-4 py-16 text-white">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mb-8 rounded-full border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
            >
              <Link href="/">
                <ArrowLeft data-icon="inline-start" />
                Voltar para home
              </Link>
            </Button>

            <div className="flex max-w-3xl flex-col gap-4">
              <h1 className="flex flex-wrap items-center gap-3 font-heading text-4xl font-bold tracking-tight md:text-6xl">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md md:size-14">
                  <Heart className="h-6 w-6 fill-current md:h-7 md:w-7" />
                </span>
                Os meus favoritos
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-white/85">
                As receitas que você salvou ficam aqui para voltar rápido quando for cozinhar.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          {isSessionPending ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: FAVORITES_PAGE_SIZE }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          ) : !session?.user ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-20 text-center">
              <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LogIn className="h-6 w-6" />
              </div>
              <h2 className="font-heading text-2xl font-bold">Entre para ver seus favoritos</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Seus favoritos são vinculados à sua conta. Faça login para carregar as receitas salvas.
              </p>
              <Button className="mt-6 rounded-full" onClick={() => setIsAuthOpen(true)}>
                <LogIn data-icon="inline-start" />
                Entrar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
                <div>
                  <h2 className="font-heading text-3xl font-bold tracking-tight">Receitas salvas</h2>
                  <p className="mt-2 text-muted-foreground">
                    {isInitialLoading
                      ? "Buscando favoritos..."
                      : `${meta?.totalItems ?? 0} receitas encontradas nos seus favoritos.`}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(16rem,1fr)_11rem] md:w-lg">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormField
                      control={form.control}
                      name="search"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(event) => {
                                field.onChange(event);
                                resetPage();
                              }}
                              placeholder="Buscar nos favoritos"
                              className="h-10 rounded-full pl-9"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="orderBy"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            if (
                              value !== GetMyFavoriteRecipesOrderBy.newest &&
                              value !== GetMyFavoriteRecipesOrderBy.oldest
                            ) {
                              return;
                            }

                            field.onChange(value);
                            resetPage();
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 w-full rounded-full">
                              <SelectValue placeholder="Ordenar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={GetMyFavoriteRecipesOrderBy.newest}>Mais recentes</SelectItem>
                            <SelectItem value={GetMyFavoriteRecipesOrderBy.oldest}>Mais antigos</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {isError ? (
                <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-20 text-center text-muted-foreground">
                  Não foi possível carregar seus favoritos agora. Tente novamente em instantes.
                </div>
              ) : isInitialLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: FAVORITES_PAGE_SIZE }).map((_, index) => (
                    <RecipeCardSkeleton key={index} />
                  ))}
                </div>
              ) : recipes.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-20 text-center">
                  <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold">
                    {debouncedSearch ? "Nenhum favorito encontrado" : "Nenhuma receita favoritada"}
                  </h2>
                  <p className="mt-2 max-w-md text-muted-foreground">
                    {debouncedSearch
                      ? "Tente buscar por outro nome ou descrição da receita."
                      : "Explore as receitas e toque no coração para montar sua lista."}
                  </p>
                  {!debouncedSearch && (
                    <Button asChild className="mt-6 rounded-full">
                      <Link href="/receitas">Explorar receitas</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {isUpdating && (
                    <p className="-mt-3 text-sm text-muted-foreground">Atualizando favoritos...</p>
                  )}
                  <div className={cn("grid grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", isUpdating && "opacity-70")}>
                    {recipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} showViews />
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
                </>
              )}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />

        <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </div>
    </Form>
  );
}
