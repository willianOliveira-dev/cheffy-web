export type PaginationMeta = {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type PaginationDisplayItem = number | "ellipsis";

type BuildPaginationItemsOptions = {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
};

export function buildPaginationItems({
  currentPage,
  totalPages,
  siblingCount = 1,
}: BuildPaginationItemsOptions): PaginationDisplayItem[] {
  if (totalPages <= 0) return [];

  const pages = new Set<number>([1, totalPages]);
  const start = Math.max(1, currentPage - siblingCount);
  const end = Math.min(totalPages, currentPage + siblingCount);

  for (let page = start; page <= end; page += 1) {
    pages.add(page);
  }

  const sortedPages = Array.from(pages).sort((left, right) => left - right);
  const items: PaginationDisplayItem[] = [];

  for (const page of sortedPages) {
    const previous = items.at(-1);

    if (typeof previous === "number" && page - previous > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  }

  return items;
}
