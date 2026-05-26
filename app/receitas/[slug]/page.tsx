import { RecipeDetailPageClient } from "@/components/recipe-detail/recipe-detail-page-client";

type RecipePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: RecipePageProps) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: `${title} - Cheffy`,
    description: `Veja ingredientes, preparo, nutrição e dicas inteligentes para ${title}.`,
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;

  return <RecipeDetailPageClient slug={slug} />;
}
