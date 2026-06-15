import { Suspense } from "react";
import { CategoryPageClient } from "@/components/category/category-page-client";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: `${title} - Cheffy`,
    description: `Explore receitas da categoria ${title} no Cheffy.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="h-16 border-b bg-background" />
          <div className="h-80 animate-pulse bg-muted" />
          <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-80 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      }
    >
      <CategoryPageClient slug={slug} />
    </Suspense>
  );
}
