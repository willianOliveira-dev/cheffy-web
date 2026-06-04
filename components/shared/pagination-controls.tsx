"use client";

import type { MouseEvent } from "react";
import { buildPaginationItems, type PaginationMeta } from "@/lib/pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationControlsProps = {
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;
};

export function PaginationControls({ meta, onPageChange }: PaginationControlsProps) {
  if (!meta || meta.totalPages <= 1) return null;

  const items = buildPaginationItems({
    currentPage: meta.page,
    totalPages: meta.totalPages,
  });

  function handlePageClick(event: MouseEvent<HTMLAnchorElement>, page: number) {
    event.preventDefault();

    if (page === meta?.page) return;
    onPageChange(page);
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="Anterior"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              if (meta.hasPrevious) onPageChange(meta.page - 1);
            }}
            className={!meta.hasPrevious ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === meta.page}
                onClick={(event) => handlePageClick(event, item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            text="Próximo"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              if (meta.hasNext) onPageChange(meta.page + 1);
            }}
            className={!meta.hasNext ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
