"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useGetHome } from "@/services/api/generated/home/home";
import { Logo } from "./logo";
import { CategoryDropdown } from "./category-dropdown";
import { MobileNav } from "./mobile-nav";
import { SearchBar } from "./search-bar";
import { AuthButton } from "@/components/auth/auth-button";

export function SiteHeader() {
  const { data } = useGetHome();

  const categories = data?.headerCategories ?? [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-8">
          <MobileNav categories={categories} />
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
          </Link>
          <div className="hidden md:flex">
            <CategoryDropdown categories={categories} />
          </div>
        </div>
        <div className="flex items-center justify-end space-x-4">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
