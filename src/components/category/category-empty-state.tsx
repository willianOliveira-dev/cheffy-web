import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CategoryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-24 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-heading text-xl font-bold">Nenhuma receita encontrada</h3>
      <p className="mt-2 max-w-md text-muted-foreground">
        Ainda não existem receitas publicadas nessa categoria.
      </p>
    </div>
  );
}

export function CategoryNotFoundState() {
  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Search className="h-6 w-6" />
      </div>
      <h1 className="font-heading text-3xl font-bold tracking-tight">Categoria não encontrada</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Não foi possível encontrar essa categoria. Volte para explorar todas as receitas disponíveis.
      </p>
      <Button asChild className="mt-8 rounded-full">
        <Link href="/receitas">Explorar receitas</Link>
      </Button>
    </main>
  );
}
