import { RecipeDetailPageClient } from "@/components/recipe-detail/recipe-detail-page-client";

type MyRecipePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: MyRecipePageProps) {
  const { id } = await params;

  return {
    title: "Minha receita - Cheffy",
    description: `Visualizacao privada da receita ${id}.`,
  };
}

export default async function MyRecipePage({ params }: MyRecipePageProps) {
  const { id } = await params;

  return <RecipeDetailPageClient recipeId={id} privateView />;
}
