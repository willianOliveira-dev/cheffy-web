import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type SearchEmptyStateProps = {
  onClearFilters: () => void;
};

export function SearchEmptyState({ onClearFilters }: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-24 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 font-heading text-xl font-bold">Nenhuma receita encontrada</h3>
      <p className="max-w-md text-muted-foreground">
        Não encontramos nenhuma receita com os filtros selecionados. Tente usar termos mais genéricos ou remover alguns filtros.
      </p>
      <Button variant="outline" className="mt-6" onClick={onClearFilters}>
        Limpar todos os filtros
      </Button>
    </div>
  );
}
