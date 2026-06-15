import type { Metadata } from "next";
import { MyRecipesPageClient } from "@/components/my-recipes/my-recipes-page-client";

export const metadata: Metadata = {
  title: "As minhas receitas - Cheffy",
  description: "Receitas criadas e salvas na sua conta Cheffy.",
};

export default function MyRecipesPage() {
  return <MyRecipesPageClient />;
}
