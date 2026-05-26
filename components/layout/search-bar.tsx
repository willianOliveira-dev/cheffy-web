"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  
  const [searchTerm, setSearchTerm] = useState(urlSearch);

  // Sync state with URL when it changes
  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/receitas?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm hidden md:flex items-center">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Buscar receitas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary rounded-full transition-colors"
      />
    </form>
  );
}
