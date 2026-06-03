"use client";

import { FallbackImage as Image } from "@/components/shared/fallback-image";
import Link from "next/link";
import { useGetCategories } from "@/api/generated/categories/categories";
import { GetCategoriesOrderBy } from "@/api/generated/model";
import { SectionTitle } from "@/components/shared/section-title";
import { CategoryIcon } from "@/components/shared/category-icon";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const CATEGORY_LIMIT = 12;

export function FavoriteFlavorsSection() {
  const { data, isLoading, isError } = useGetCategories({
    orderBy: GetCategoriesOrderBy.position,
    limit: CATEGORY_LIMIT,
  });

  const categories = data?.data ?? [];

  if (isError) return null;

  return (
    <section id="sabores-favoritos" className="relative overflow-hidden bg-background py-20 md:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionTitle>Seus Sabores favoritos</SectionTitle>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Escolha por vontade, não por menu. Cada categoria leva direto para receitas do mesmo tipo.
            </p>
          </div>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: categories.length > 5,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-5 py-2">
            {isLoading
              ? Array.from({ length: 7 }).map((_, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-5 basis-[58%] sm:basis-[34%] md:basis-[25%] lg:basis-[18%] xl:basis-[15%]"
                  >
                    <div className="flex flex-col items-center gap-4 rounded-[2rem] border bg-card p-5 shadow-sm">
                      <div className="size-32 animate-pulse rounded-full bg-muted md:size-36" />
                      <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
                    </div>
                  </CarouselItem>
                ))
              : categories.map((category) => (
                  <CarouselItem
                    key={category.id}
                    className="pl-5 basis-[58%] sm:basis-[34%] md:basis-[25%] lg:basis-[18%] xl:basis-[15%]"
                  >
                    <Link
                      href={`/categorias/${category.slug}`}
                      className="group flex h-full flex-col items-center gap-4 rounded-[2rem] border border-border/70 bg-card p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                    >
                      <div className="relative size-32 overflow-hidden rounded-full bg-muted ring-8 ring-muted/60 transition-transform duration-300 group-hover:scale-[1.03] md:size-36">
                        {category.imageUrl ? (
                          <Image
                            src={category.imageUrl}
                            alt={category.name}
                            fill
                            sizes="(min-width: 1280px) 180px, (min-width: 768px) 160px, 140px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                            <CategoryIcon iconKey={category.iconKey} className="h-10 w-10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/5 to-transparent opacity-80" />
                        <div className="absolute bottom-3 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-background/95 text-primary shadow-lg backdrop-blur">
                          <CategoryIcon iconKey={category.iconKey} className="h-5 w-5" />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-heading text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
          </CarouselContent>

          <div className="absolute -top-16 right-0 hidden gap-2 md:flex">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
