import type { GetMyRecipesOrderBy } from "@/services/api/generated/model";

export const MY_RECIPES_PAGE_SIZE = 10;

export type MyRecipesPublicationFilter = "all" | "draft" | "published";

export type MyRecipesFilters = {
  search: string;
  orderBy: GetMyRecipesOrderBy;
  isPublished: MyRecipesPublicationFilter;
  page: number;
};
