import type { GetMyRecipesOrderBy } from "@/services/api/generated/model";

export type MyRecipesPublicationFilter = "all" | "draft" | "published";

export type MyRecipesFilters = {
  search: string;
  orderBy: GetMyRecipesOrderBy;
  isPublished: MyRecipesPublicationFilter;
  page: number;
};
