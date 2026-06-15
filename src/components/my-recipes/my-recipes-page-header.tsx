import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MyRecipesPageHeader() {
  return (
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
  );
}
