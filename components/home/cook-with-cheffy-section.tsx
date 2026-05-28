import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookWithCheffySection() {
  return (
    <section className="bg-background px-4 py-20 md:py-24">
      <div className="container mx-auto">
        <div className="relative min-h-128 overflow-hidden rounded-[2rem] border border-border/60 bg-foreground text-background shadow-2xl shadow-primary/10">
          <Image
            src="/images/woman-cooking.png"
            alt="Mulher cozinhando em uma cozinha iluminada"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/62 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/55 to-transparent" />

          <div className="relative z-10 flex min-h-128 max-w-3xl flex-col justify-end px-6 py-8 text-white sm:px-10 md:px-14 md:py-12">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-md">
                receitas salvas
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-md">
                passo a passo claro
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-md">
                ajuda na hora certa
              </span>
            </div>

            <h2 className="max-w-2xl font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Escolha uma receita e deixe o resto organizado.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/82 sm:text-lg">
              O Cheffy segura o fio da cozinha com você: ingredientes no lugar, etapas fáceis de seguir
              e uma mãozinha quando aparece aquela dúvida no meio do preparo.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-white px-7 text-base font-semibold text-foreground hover:bg-white/90"
              >
                <Link href="/receitas">
                  <Search data-icon="inline-start" />
                  Encontrar receita
                </Link>
              </Button>
            </div>
          </div>

          <div className="absolute right-6 top-6 hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-md md:flex md:items-center md:gap-2">
            Comece pelo que dá vontade
            <ArrowRight data-icon="inline-end" />
          </div>
        </div>
      </div>
    </section>
  );
}
