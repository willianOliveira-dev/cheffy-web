"use client";

import { useMemo, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { GetMyFavoriteRecipesOrderBy } from "@/services/api/generated/model/getMyFavoriteRecipesOrderBy";
import { useGetMyFavoriteRecipes } from "@/services/api/generated/users/users";
import { cn } from "@/utils/class-names";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { RecipeCard } from "@/components/shared/recipe-card";
import { RecipeCardSkeleton } from "@/components/shared/recipe-card-skeleton";
import { SearchSubmitField } from "@/components/shared/search-submit-field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/services/auth/client";
import { FavoritesHero } from "./favorites-hero";
import { FavoritesAuthPrompt, FavoritesEmptyState } from "./favorites-empty-state";

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
  const [submittedSearch, setSubmittedSearch] = useState(search.trim());

  const favoriteParams = useMemo(
    () => ({
      page,
      limit: FAVORITES_PAGE_SIZE,
      search: submittedSearch || undefined,
      orderBy,
    }),
    [orderBy, page, submittedSearch],
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
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
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

  const handleSearchSubmit = () => {
    setSubmittedSearch((form.getValues("search") || "").trim());
    resetPage();
  };

  return (
    <Form {...form}>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />

        <main className="flex-1">
          <FavoritesHero />

          <section className="container mx-auto px-4 py-10 md:py-14">
            {isSessionPending ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: FAVORITES_PAGE_SIZE }).map((_, index) => (
                  <RecipeCardSkeleton key={index} />
                ))}
              </div>
            ) : !session?.user ? (
              <FavoritesAuthPrompt onLoginClick={() => setIsAuthOpen(true)} />
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
                    <SearchSubmitField
                      control={form.control}
                      name="search"
                      placeholder="Buscar nos favoritos"
                      ariaLabel="Pesquisar favoritos"
                      inputClassName="h-10 rounded-full"
                      onSubmit={handleSearchSubmit}
                    />

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
                  <FavoritesEmptyState search={submittedSearch} />
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

                    <PaginationControls meta={meta} onPageChange={handlePageChange} />
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
