import Image from "next/image";
import Link from "next/link";
import { Home, Search } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export function RecipeDetailNotFoundState() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <section className="flex w-full max-w-2xl flex-col items-center text-center">
          <div className="relative mb-8 flex w-28 justify-center sm:w-32 md:w-36">
            <div className="pointer-events-none absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(254,192,133,0.42)_0%,rgba(254,192,133,0)_68%)] blur-xl" />
            <Image
              src="/images/recipe-not-found.svg"
              alt="Receita não encontrada"
              width={738}
              height={1174}
              priority
              className="relative h-auto max-h-44 w-full object-contain drop-shadow-[0_16px_22px_rgba(95,49,16,0.14)]"
            />
          </div>

          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-5xl">
            Receita indisponível
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground md:text-lg">
            Não conseguimos carregar a receita solicitada. Ela pode ter sido removida,
            estar em rascunho ou o link pode estar incorreto.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/receitas">
                <Search data-icon="inline-start" />
                Explorar receitas
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/">
                <Home data-icon="inline-start" />
                Ir para home
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
