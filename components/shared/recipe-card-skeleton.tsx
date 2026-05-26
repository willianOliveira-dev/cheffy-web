import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecipeCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/50 bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <CardContent className="flex flex-1 flex-col p-4">
        <Skeleton className="mb-3 h-6 w-3/4" />
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardFooter>
    </Card>
  );
}
