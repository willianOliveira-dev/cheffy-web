import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SearchPageClient } from "@/components/search/search-page-client";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Explorar Receitas - Cheffy",
  description: "Busque receitas deliciosas por categoria, tags, dificuldade e muito mais.",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 md:py-28 overflow-hidden flex items-center justify-center border-b border-border/40">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/search-hero.png"
            alt="Preparando receita"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/70" />
        </div>

        <div className="container absolute left-1/2 top-6 z-10 mx-auto -translate-x-1/2 px-4">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-full border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar para home
            </Link>
          </Button>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight text-white drop-shadow-md">
            Descubra Novas Receitas
          </h1>
          <p className="text-zinc-200 text-lg md:text-xl max-w-2xl mx-auto drop-shadow">
            Explore nossa vasta coleção de receitas. Use os filtros para encontrar a refeição perfeita para o seu dia.
          </p>
        </div>
      </section>

      <Suspense fallback={<div className="container mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="h-[400px] w-full bg-muted rounded"></div>
      </div>}>
        <SearchPageClient />
      </Suspense>
    </div>
  );
}
