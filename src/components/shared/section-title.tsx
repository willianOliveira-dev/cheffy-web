import { cn } from "@/utils/class-names";
import React from "react";

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {children}
      </h2>
      <div className="h-1 w-12 rounded-full bg-primary" />
    </div>
  );
}
