"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type RecipeSubmitActionsProps = {
  submitLabel: string;
  isSubmitting: boolean;
  isUploading: boolean;
};

export function RecipeSubmitActions({
  submitLabel,
  isSubmitting,
  isUploading,
}: RecipeSubmitActionsProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" asChild>
          <Link href="/minhas-receitas">
            <ArrowLeft data-icon="inline-start" />
            Voltar
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Save data-icon="inline-start" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
