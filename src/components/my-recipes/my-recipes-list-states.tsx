import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function MyRecipesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function MyRecipesEmptyState() {
  return (
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
  );
}

export function MyRecipesErrorState() {
  return (
    <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
      Não conseguimos carregar suas receitas agora. Tente novamente em instantes.
    </div>
  );
}
