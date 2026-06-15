"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import { cn } from "@/utils/class-names";
import { Button } from "@/components/ui/button";

type RecipeItemMoveControlsProps = {
  index: number;
  count: number;
  removeDisabled: boolean;
  direction?: "horizontal" | "vertical";
  size?: "icon-xs" | "icon-sm";
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
};

export function RecipeItemMoveControls({
  index,
  count,
  removeDisabled,
  direction = "vertical",
  size = "icon-sm",
  onMove,
  onRemove,
}: RecipeItemMoveControlsProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 gap-1",
        direction === "vertical" ? "flex-col" : "flex-row",
      )}
    >
      <Button
        type="button"
        size={size}
        variant="outline"
        disabled={index === 0}
        aria-label="Mover para cima"
        onClick={() => onMove(-1)}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        size={size}
        variant="outline"
        disabled={index === count - 1}
        aria-label="Mover para baixo"
        onClick={() => onMove(1)}
      >
        <ArrowDown />
      </Button>
      <Button
        type="button"
        size={size}
        variant="outline"
        disabled={removeDisabled}
        aria-label="Remover"
        onClick={onRemove}
      >
        <X />
      </Button>
    </div>
  );
}
