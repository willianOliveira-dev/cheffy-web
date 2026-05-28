import Link from "next/link";
import { Heart, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

type FavoritesEmptyStateProps = {
  debouncedSearch: string;
};

export function FavoritesEmptyState({ debouncedSearch }: FavoritesEmptyStateProps) {
  return (
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
  );
}

type FavoritesAuthPromptProps = {
  onLoginClick: () => void;
};

export function FavoritesAuthPrompt({ onLoginClick }: FavoritesAuthPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-20 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LogIn className="h-6 w-6" />
      </div>
      <h2 className="font-heading text-2xl font-bold">Entre para ver seus favoritos</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Seus favoritos são vinculados à sua conta. Faça login para carregar as receitas salvas.
      </p>
      <Button className="mt-6 rounded-full" onClick={onLoginClick}>
        <LogIn data-icon="inline-start" />
        Entrar
      </Button>
    </div>
  );
}
