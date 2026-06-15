import { z } from "zod";
import { GetRecipesDifficulty, GetRecipesOrderBy } from "@/services/api/generated/model";

export const searchSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
  difficulty: z.nativeEnum(GetRecipesDifficulty).optional(),
  maxTotalTime: z.number().optional(),
  orderBy: z.nativeEnum(GetRecipesOrderBy).optional(),
  page: z.number().min(1).optional(),
});

export type SearchFormValues = z.infer<typeof searchSchema>;
