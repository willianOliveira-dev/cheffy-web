import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export function RecipeDetailLoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Skeleton className="h-136 w-full rounded-none" />
      <main className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    </div>
  );
}
