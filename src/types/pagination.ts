export type PaginationMeta = {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type PaginationDisplayItem = number | "ellipsis";
