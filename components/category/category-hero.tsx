import { createElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronRight, icons } from "lucide-react";
import { Button } from "@/components/ui/button";

export function getCategoryIcon(iconKey?: string) {
  const iconName = iconKey
    ? iconKey
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("")
    : "Utensils";

  return icons[iconName as keyof typeof icons] || icons.Utensils;
}

export function CategoryIcon({
  iconKey,
  className,
}: {
  iconKey?: string;
  className?: string;
}) {
  const IconComponent = getCategoryIcon(iconKey);

  return createElement(IconComponent, { className });
}

type CategoryHeroProps = {
  category: {
    name: string;
    imageUrl?: string | null;
    iconKey?: string | null;
    description?: string | null;
  } | null;
  isLoadingCategory: boolean;
};

export function CategoryHero({ category, isLoadingCategory }: CategoryHeroProps) {
  return (
    <section className="relative flex min-h-[22rem] items-center overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 z-0">
        <Image
          src={category?.imageUrl || "/images/search-hero.png"}
          alt={category?.name || "Categoria de receitas"}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/55 to-black/35" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 text-white">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="mb-8 rounded-full border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" data-icon="inline-start" />
            Voltar para home
          </Link>
        </Button>

        <div className="flex max-w-3xl flex-col gap-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/75">
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>Categoria</span>
            </div>
            <h1 className="flex flex-wrap items-center gap-4 font-heading text-4xl font-bold tracking-tight md:text-6xl">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md md:h-14 md:w-14">
                <CategoryIcon iconKey={category?.iconKey ?? undefined} className="h-6 w-6 md:h-7 md:w-7" />
              </span>
              {isLoadingCategory ? "Carregando categoria..." : category?.name}
            </h1>
            {category?.description && (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
