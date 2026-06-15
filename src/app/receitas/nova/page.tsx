import type { Metadata } from "next";
import { RecipeEditorPageClient } from "@/components/my-recipes/recipe-editor-page-client";

export const metadata: Metadata = {
  title: "Compartilhar receita - Cheffy",
  description: "Crie uma nova receita na sua conta Cheffy.",
};

export default function NewRecipePage() {
  return <RecipeEditorPageClient />;
}
