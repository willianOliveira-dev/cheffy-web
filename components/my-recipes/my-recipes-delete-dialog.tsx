"use client";

import { Loader2 } from "lucide-react";
import type { RecipeSummary } from "@/api/generated/model";
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

type MyRecipesDeleteDialogProps = {
  recipe: RecipeSummary | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function MyRecipesDeleteDialog({
  recipe,
  isDeleting,
  onOpenChange,
  onConfirm,
}: MyRecipesDeleteDialogProps) {
  return (
    <AlertDialog open={Boolean(recipe)} onOpenChange={onOpenChange}>
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
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isDeleting && <Loader2 data-icon="inline-start" className="animate-spin" />}
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
