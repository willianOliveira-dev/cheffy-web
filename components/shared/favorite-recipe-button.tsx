"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useFavoriteRecipe, useUnfavoriteRecipe, getGetRecipesQueryKey } from "@/api/generated/recipes/recipes";
import { getGetMyFavoriteRecipesQueryKey } from "@/api/generated/users/users";
import { getGetHomeQueryKey } from "@/api/generated/home/home";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";

type FavoriteRecipeButtonProps = {
  recipeId: string;
  initialFavorited?: boolean;
  showLabel?: boolean;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  onClickCapture?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function FavoriteRecipeButton({
  recipeId,
  initialFavorited = false,
  showLabel = true,
  className,
  variant = "outline",
  size = "default",
  onClickCapture,
}: FavoriteRecipeButtonProps) {
  const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const isFavorited = favoriteOverrides[recipeId] ?? initialFavorited;

  const queryClient = useQueryClient();

  const favoriteMutation = useFavoriteRecipe({
    mutation: {
      onSuccess: () => {
        setFavoriteOverrides((current) => ({ ...current, [recipeId]: true }));
        toast.success("Receita adicionada aos favoritos!");
        queryClient.invalidateQueries({ queryKey: getGetRecipesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMyFavoriteRecipesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetHomeQueryKey() });
      },
      onError: () => {
        toast.error("Erro ao favoritar a receita. Tente novamente.");
      },
    },
  });
  
  const unfavoriteMutation = useUnfavoriteRecipe({
    mutation: {
      onSuccess: () => {
        setFavoriteOverrides((current) => ({ ...current, [recipeId]: false }));
        toast.success("Receita removida dos favoritos.");
        queryClient.invalidateQueries({ queryKey: getGetRecipesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMyFavoriteRecipesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetHomeQueryKey() });
      },
      onError: () => {
        toast.error("Erro ao remover dos favoritos. Tente novamente.");
      },
    },
  });

  const isPending = favoriteMutation.isPending || unfavoriteMutation.isPending;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClickCapture?.(event);

    if (!session) {
      setIsAuthOpen(true);
      return;
    }

    if (isFavorited) {
      unfavoriteMutation.mutate({ id: recipeId });
      return;
    }

    favoriteMutation.mutate({ id: recipeId });
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(showLabel && "rounded-full", className)}
        disabled={isPending}
        aria-pressed={isFavorited}
        onClick={handleClick}
      >
        {isPending ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <Heart
            data-icon={showLabel ? "inline-start" : undefined}
            className={cn(isFavorited && "fill-current text-destructive")}
          />
        )}
        {showLabel && (isFavorited ? "Favoritada" : "Favoritar")}
      </Button>

      <AuthDialog
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        title="Entre para favoritar"
        description="Faça login com sua conta Google para salvar essa receita nos seus favoritos."
      />
    </>
  );
}
