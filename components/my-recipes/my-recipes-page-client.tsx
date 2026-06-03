"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm, useWatch } from "react-hook-form";
import { getGetMyRecipesQueryKey, useDeleteMyRecipe, useGetMyRecipes } from "@/api/generated/my-recipes/my-recipes";
import { GetMyRecipesIsPublished, GetMyRecipesOrderBy, type RecipeSummary } from "@/api/generated/model";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SearchSubmitField } from "@/components/shared/search-submit-field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MY_RECIPES_PAGE_SIZE = 10;

type MyRecipesFilters = {
  search: string;
  orderBy: GetMyRecipesOrderBy;
  isPublished: "all" | "draft" | "published";
  page: number;
};

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

  if (!session?.user && !isSessionPending) {
    return null;
  }

  return (
    <Form {...form}>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="container mx-auto flex-1 px-4 py-8 md:py-12">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receitas</p>
              <h1 className="font-heading text-3xl font-bold tracking-tight md:text-5xl">
                As minhas receitas
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Suas receitas ficam aqui enquanto você cria, revisa e ajusta.
              </p>
            </div>
            <Button asChild>
              <Link href="/receitas/nova">
                <Plus data-icon="inline-start" />
                Nova receita
              </Link>
            </Button>
          </div>

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

              <div className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_10rem_10rem] md:w-2xl">
                <SearchSubmitField
                  control={form.control}
                  name="search"
                  placeholder="Buscar nas minhas receitas"
                  ariaLabel="Pesquisar minhas receitas"
                  inputClassName="h-10 rounded-full"
                  onSubmit={handleSearchSubmit}
                />

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          resetPage();
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full rounded-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="draft">Rascunhos</SelectItem>
                            <SelectItem value="published">Publicadas</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderBy"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          resetPage();
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full rounded-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value={GetMyRecipesOrderBy.newest}>Mais recentes</SelectItem>
                            <SelectItem value={GetMyRecipesOrderBy.oldest}>Mais antigas</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-5">
              {isInitialLoading ? (
                <MyRecipesSkeleton />
              ) : isError ? (
                <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
                  Não conseguimos carregar suas receitas agora. Tente novamente em instantes.
                </div>
              ) : recipes.length === 0 ? (
                <div className="rounded-xl border border-dashed py-16 text-center">
                  <h2 className="font-heading text-2xl font-semibold">Nenhuma receita encontrada</h2>
                  <p className="mt-2 text-muted-foreground">
                    Quando você salvar uma receita, ela aparece aqui.
                  </p>
                  <Button asChild className="mt-5">
                    <Link href="/receitas/nova">
                      <Plus data-icon="inline-start" />
                      Compartilhar receita
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  {isUpdating && (
                    <p className="-mt-2 text-sm text-muted-foreground">Atualizando receitas...</p>
                  )}

                  <div className={cn("transition-opacity", isUpdating && "opacity-70")}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Receita</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tempo</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recipes.map((recipe) => (
                          <TableRow key={recipe.id}>
                            <TableCell>
                              <div className="flex min-w-0 flex-col">
                                <span className="font-medium">{recipe.title}</span>
                                <span className="max-w-lg truncate text-xs text-muted-foreground">
                                  {recipe.description}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={recipe.isPublished ? "default" : "secondary"}>
                                {recipe.isPublished ? "Publicada" : "Rascunho"}
                              </Badge>
                            </TableCell>
                            <TableCell>{recipe.totalTime} min</TableCell>
                            <TableCell>{recipe.category.name}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button asChild size="icon-sm" variant="outline">
                                  <Link href={`/minhas-receitas/${recipe.id}/editar`} aria-label={`Editar ${recipe.title}`}>
                                    <Edit />
                                  </Link>
                                </Button>
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="outline"
                                  aria-label={`Remover ${recipe.title}`}
                                  onClick={() => setRecipeToDelete(recipe)}
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
            </CardContent>
          </Card>
        </main>
        <SiteFooter />

        <AlertDialog open={Boolean(recipeToDelete)} onOpenChange={(open) => !open && setRecipeToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover receita?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa receita será retirada da sua lista. Não dá para desfazer depois.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  if (recipeToDelete) deleteMutation.mutate({ id: recipeToDelete.id });
                }}
              >
                {deleteMutation.isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Form>
  );
}

function MyRecipesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  );
}
