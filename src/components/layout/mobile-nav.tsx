"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import type { HomeHeaderCategory } from "@/services/api/generated/model";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileNavProps = {
  categories: HomeHeaderCategory[];
};

export function MobileNav({ categories }: MobileNavProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    router.push(`/receitas?search=${encodeURIComponent(trimmed)}`);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleCategoryClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[85vw] max-w-xs overflow-y-auto p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-lg">Navegação</SheetTitle>
          <SheetDescription className="text-sm">
            Busque receitas ou explore por categoria.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-5 py-6">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              placeholder="Buscar receitas..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="rounded-full border-border/70 bg-muted/50 pl-9 transition-colors focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary"
            />
          </form>

          <div className="flex flex-col gap-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categorias
            </p>
            <nav className="flex flex-col gap-0.5">
              {categories.map((category) => (
                <SheetClose key={category.id} asChild>
                  <Link
                    href={`/categorias/${category.slug}`}
                    onClick={handleCategoryClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <CategoryIcon iconKey={category.iconKey} className="h-4 w-4" />
                    </div>
                    {category.name}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </div>

          <SheetClose asChild>
            <Link
              href="/receitas"
              className="rounded-full border border-border/70 px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Ver todas as receitas
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
