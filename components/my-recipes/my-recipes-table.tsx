"use client";

import Link from "next/link";
import { Edit, Eye, Trash2 } from "lucide-react";
import type { RecipeSummary } from "@/api/generated/model";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MyRecipesTableProps = {
  recipes: RecipeSummary[];
  isUpdating: boolean;
  onDeleteClick: (recipe: RecipeSummary) => void;
};

export function MyRecipesTable({ recipes, isUpdating, onDeleteClick }: MyRecipesTableProps) {
  return (
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
                      <Link href={`/minhas-receitas/${recipe.id}`} aria-label={`Visualizar ${recipe.title}`}>
                        <Eye />
                      </Link>
                    </Button>
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
                      onClick={() => onDeleteClick(recipe)}
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
    </>
  );
}
