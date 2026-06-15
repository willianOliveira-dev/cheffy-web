"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { getGetMyRecipesQueryKey, useDeleteMyRecipe, useGetMyRecipes } from "@/services/api/generated/my-recipes/my-recipes";
import { GetMyRecipesIsPublished, GetMyRecipesOrderBy, type RecipeSummary } from "@/services/api/generated/model";
import { authClient } from "@/lib/auth-client";
import { MY_RECIPES_PAGE_SIZE, type MyRecipesFilters } from "@/lib/my-recipes/my-recipes-list-types";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { MyRecipesDeleteDialog } from "./my-recipes-delete-dialog";
import { MyRecipesEmptyState, MyRecipesErrorState, MyRecipesSkeleton } from "./my-recipes-list-states";
import { MyRecipesPageHeader } from "./my-recipes-page-header";
import { MyRecipesTable } from "./my-recipes-table";
import { MyRecipesToolbar } from "./my-recipes-toolbar";

export function MyRecipesPageClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [recipeToDelete, setRecipeToDelete] = useState<RecipeSummary | null>(null);
  const [submittedSearch, setSubmittedSearch] = useState("");
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const form = useForm<MyRecipesFilters>({
    defaultValues: {
      search: "",
      orderBy: GetMyRecipesOrderBy.newest,
      isPublished: "all",
      page: 1,
    },
  });

  const orderBy = useWatch({ control: form.control, name: "orderBy" });
  const isPublished = useWatch({ control: form.control, name: "isPublished" });
  const page = useWatch({ control: form.control, name: "page" }) || 1;

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.replace("/");
    }
  }, [isSessionPending, router, session?.user]);

  const params = useMemo(
    () => ({
      page,
      limit: MY_RECIPES_PAGE_SIZE,
      search: submittedSearch || undefined,
      orderBy,
      isPublished:
        isPublished === "all"
          ? undefined
          : isPublished === "published"
            ? GetMyRecipesIsPublished.true
            : GetMyRecipesIsPublished.false,
    }),
    [isPublished, orderBy, page, submittedSearch],
  );

  const { data, isLoading, isFetching, isError } = useGetMyRecipes(params, {
    query: {
      enabled: Boolean(session?.user),
      placeholderData: keepPreviousData,
      staleTime: 60 * 1000,
    },
  });

  const deleteMutation = useDeleteMyRecipe({
    mutation: {
      onSuccess: async () => {
        toast.success("Receita removida.");
        setRecipeToDelete(null);
        await queryClient.invalidateQueries({ queryKey: getGetMyRecipesQueryKey() });
      },
      onError: () => {
        toast.error("Não conseguimos remover essa receita agora.");
      },
    },
  });

  const recipes = data?.items ?? [];
  const meta = data?.meta;
  const isInitialLoading = isSessionPending || (isLoading && !data);
  const isUpdating = isFetching && Boolean(data);

  function resetPage() {
    if (form.getValues("page") !== 1) {
      form.setValue("page", 1, { shouldValidate: false });
    }
  }

  function handleSearchSubmit() {
    setSubmittedSearch((form.getValues("search") || "").trim());
    resetPage();
  }

  function handlePageChange(nextPage: number) {
    form.setValue("page", nextPage, { shouldValidate: false });
    scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteConfirm() {
    if (recipeToDelete) {
      deleteMutation.mutate({ id: recipeToDelete.id });
    }
  }

  if (!session?.user && !isSessionPending) {
    return null;
  }

  return (
    <Form {...form}>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="container mx-auto flex-1 px-4 py-8 md:py-12">
          <MyRecipesPageHeader />

          <Card>
            <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle className="text-xl md:text-2xl">Receitas salvas</CardTitle>
                <CardDescription>
                  {isInitialLoading
                    ? "Carregando..."
                    : `${meta?.totalItems ?? 0} receita${(meta?.totalItems ?? 0) === 1 ? "" : "s"} salva${(meta?.totalItems ?? 0) === 1 ? "" : "s"}.`}
                </CardDescription>
              </div>

              <MyRecipesToolbar
                form={form}
                onSearchSubmit={handleSearchSubmit}
                onFilterChange={resetPage}
              />
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              {isInitialLoading ? (
                <MyRecipesSkeleton />
              ) : isError ? (
                <MyRecipesErrorState />
              ) : recipes.length === 0 ? (
                <MyRecipesEmptyState />
              ) : (
                <>
                  <MyRecipesTable
                    recipes={recipes}
                    isUpdating={isUpdating}
                    onDeleteClick={setRecipeToDelete}
                  />
                  <PaginationControls meta={meta} onPageChange={handlePageChange} />
                </>
              )}
            </CardContent>
          </Card>
        </main>
        <SiteFooter />

        <MyRecipesDeleteDialog
          recipe={recipeToDelete}
          isDeleting={deleteMutation.isPending}
          onOpenChange={(open) => !open && setRecipeToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </Form>
  );
}
