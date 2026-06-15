import type { Metadata } from "next";
import { FavoritesPageClient } from "@/components/favorites/favorites-page-client";

export const metadata: Metadata = {
  title: "Os meus favoritos - Cheffy",
  description: "Receitas salvas na sua conta Cheffy.",
};

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
