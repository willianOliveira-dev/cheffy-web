"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetHomeQueryKey } from "@/services/api/generated/home/home";
import { useGetMyRecipeById } from "@/services/api/generated/my-recipes/my-recipes";
import { getGetRecipesQueryKey, useGetRecipeBySlug } from "@/services/api/generated/recipes/recipes";
import { getGetMyFavoriteRecipesQueryKey } from "@/services/api/generated/users/users";
import { authClient } from "@/lib/auth-client";

type UseRecipeDetailParams = {
  slug?: string;
  recipeId?: string;
  privateView?: boolean;
};

export function useRecipeDetail({ slug, recipeId, privateView = false }: UseRecipeDetailParams) {
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const publicRecipeQuery = useGetRecipeBySlug(slug ?? "", {
    query: {
      enabled: Boolean(!privateView && slug),
    },
  });
  const privateRecipeQuery = useGetMyRecipeById(recipeId ?? "", {
    query: {
      enabled: Boolean(privateView && recipeId && session?.user),
    },
  });

  const activeQuery = privateView ? privateRecipeQuery : publicRecipeQuery;
  const recipe = activeQuery.data;
  const isLoading = activeQuery.isLoading || (privateView && isSessionPending);
  const isUnavailable = activeQuery.isError || (!privateView && recipe?.isPublished === false);

  useEffect(() => {
    if (!recipe) return;

    queryClient.invalidateQueries({ queryKey: getGetRecipesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetMyFavoriteRecipesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetHomeQueryKey() });
  }, [recipe, queryClient]);

  return {
    recipe,
    isLoading,
    isUnavailable,
    privateView,
  };
}
