import type { Metadata } from "next";
import { RecipeEditorPageClient } from "@/components/my-recipes/recipe-editor-page-client";

type EditMyRecipePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Editar receita - Cheffy",
  description: "Edite uma receita criada na sua conta Cheffy.",
};

export default async function EditMyRecipePage({ params }: EditMyRecipePageProps) {
  const { id } = await params;

  return <RecipeEditorPageClient recipeId={id} />;
}
