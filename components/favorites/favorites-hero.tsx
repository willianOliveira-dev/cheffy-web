import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FavoritesHero() {
  return (
    <section className="relative flex min-h-96 items-center overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/favorites-image.jpg"
          alt="Receitas salvas em uma mesa"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/25" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 text-white">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="mb-8 rounded-full border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
        >
          <Link href="/">
            <ArrowLeft data-icon="inline-start" />
            Voltar para home
          </Link>
        </Button>

        <div className="flex max-w-3xl flex-col gap-4">
          <h1 className="flex flex-wrap items-center gap-3 font-heading text-4xl font-bold tracking-tight md:text-6xl">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md md:size-14">
              <Heart className="h-6 w-6 fill-current md:h-7 md:w-7" />
            </span>
            Os meus favoritos
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-white/85">
            As receitas que você salvou ficam aqui para voltar rápido quando for cozinhar.
          </p>
        </div>
      </div>
    </section>
  );
}
