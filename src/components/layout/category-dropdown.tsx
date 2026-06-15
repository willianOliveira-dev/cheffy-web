"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { icons } from "lucide-react";
import { HomeHeaderCategory } from "@/services/api/generated/model";

export function CategoryDropdown({ categories }: { categories: HomeHeaderCategory[] }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-sm font-medium hover:text-primary">
            Receitas
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-3 lg:w-[600px]">
              {categories.map((category) => {
                const iconName = category.iconKey
                  ? category.iconKey.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
                  : "Utensils";
                
                const IconComponent = icons[iconName as keyof typeof icons] || icons.Utensils;

                return (
                  <li key={category.id}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={`/categorias/${category.slug}`}
                        className="flex items-center gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-medium leading-none">{category.name}</div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                );
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
