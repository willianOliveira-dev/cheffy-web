import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-image.jpeg"
          alt="Homem preparando comida na cozinha"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-r from-orange-500/90 via-orange-500/60 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left text-white">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
            <span className="text-sm font-medium tracking-wide">Descubra sabores incríveis</span>
          </div>

          <h1 className="mb-6 font-heading text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Receitas que <em className="text-orange-200 drop-shadow-sm not-italic">inspiram</em>
          </h1>

          <p className="mb-10 text-lg leading-relaxed text-white/90 sm:text-xl">
            Explore milhares de receitas criadas e avaliadas pela nossa comunidade.
            De refeições rápidas para o dia a dia a pratos elaborados para ocasiões especiais,
            encontre a inspiração certa para sua próxima aventura na cozinha.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-transparent bg-white px-8 text-base font-semibold text-orange-600 shadow-lg hover:bg-white hover:text-orange-600"
            >
              <Link href="/receitas">Explorar Receitas</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full text-base h-12 px-8 font-semibold bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white"
            >
              Compartilhar Receita
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
