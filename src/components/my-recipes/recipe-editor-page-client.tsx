"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { CreateMyRecipeBody } from "@/services/api/generated/model";
import {
  getGetMyRecipeByIdQueryKey,
  getGetMyRecipesQueryKey,
  useCreateMyRecipe,
  useGetMyRecipeById,
  useUpdateMyRecipe,
} from "@/services/api/generated/my-recipes/my-recipes";
import { authClient } from "@/services/auth/client";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeForm } from "./recipe-form";

type RecipeEditorPageClientProps = {
  recipeId?: string;
};

export function RecipeEditorPageClient({ recipeId }: RecipeEditorPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const isEdit = Boolean(recipeId);

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.replace("/");
    }
  }, [isSessionPending, router, session?.user]);

  const recipeQuery = useGetMyRecipeById(recipeId ?? "", {
    query: {
      enabled: Boolean(session?.user && recipeId),
      staleTime: 60 * 1000,
    },
  });

  const createMutation = useCreateMyRecipe({
    mutation: {
      onSuccess: async () => {
        toast.success("Receita salva. Você pode continuar editando quando quiser.");
        await queryClient.invalidateQueries({ queryKey: getGetMyRecipesQueryKey() });
      },
      onError: () => {
        toast.error("Não conseguimos salvar agora. Tente novamente em instantes.");
      },
    },
  });

  const updateMutation = useUpdateMyRecipe({
    mutation: {
      onSuccess: async (_, variables) => {
        toast.success("Mudanças salvas.");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getGetMyRecipesQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getGetMyRecipeByIdQueryKey(variables.id) }),
        ]);
      },
      onError: () => {
        toast.error("Não conseguimos salvar agora. Tente novamente em instantes.");
      },
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (!session?.user && !isSessionPending) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto flex-1 px-4 py-8 md:py-12">
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">Receitas</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-5xl">
            {isEdit ? "Editar receita" : "Compartilhar receita"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {isEdit
              ? "Ajuste os detalhes e salve quando estiver pronto."
              : "Escreva sua receita do seu jeito. Ela fica salva para você continuar depois."}
          </p>
        </div>

        {isSessionPending || (isEdit && recipeQuery.isLoading) ? (
          <EditorSkeleton />
        ) : isEdit && recipeQuery.isError ? (
          <Alert variant="destructive" className="max-w-2xl">
            <AlertCircle />
            <AlertTitle>Não encontrei essa receita</AlertTitle>
            <AlertDescription>
              Ela pode ter sido removida ou não estar na sua conta.
            </AlertDescription>
          </Alert>
        ) : (
          <RecipeForm
            mode={isEdit ? "edit" : "create"}
            recipe={recipeQuery.data}
            isSubmitting={isSubmitting}
            onSubmit={async (data: CreateMyRecipeBody) => {
              if (isEdit && recipeId) {
                return await updateMutation.mutateAsync({ id: recipeId, data });
              }

              return await createMutation.mutateAsync({ data });
            }}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_29rem]">
      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
