"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { CreateMyRecipeBody, Ingredient, Recipe } from "@/services/api/generated/model";
import { useGetCategories } from "@/services/api/generated/categories/categories";
import { useGetIngredients } from "@/services/api/generated/ingredients/ingredients";
import { useSignUpload } from "@/services/api/generated/storage/storage";
import { useGetTags } from "@/services/api/generated/tags/tags";
import { EMPTY_TAG_IDS, INGREDIENTS_PAGE_SIZE } from "@/lib/my-recipes/recipe-form-constants";
import {
  buildRecipePayload,
  getRecipeIngredients,
  getRecipeTags,
  mergeIngredients,
  mergeTags,
} from "@/lib/my-recipes/recipe-form-helpers";
import {
  createEmptyRecipeFormValues,
  mapRecipeToFormValues,
  type RecipeFormMode,
  type RecipeFormValues,
} from "@/lib/my-recipes/recipe-form-types";

type UseRecipeFormControllerParams = {
  mode: RecipeFormMode;
  recipe?: Recipe;
  isSubmitting: boolean;
  onSubmit: (data: CreateMyRecipeBody) => Promise<Recipe | void>;
};

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

export function useRecipeFormController({
  mode,
  recipe,
  isSubmitting,
  onSubmit,
}: UseRecipeFormControllerParams) {
  const router = useRouter();
  const signUploadMutation = useSignUpload();
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadingStepKey, setUploadingStepKey] = useState<string | null>(null);
  const [tagSelectValue, setTagSelectValue] = useState<string | undefined>(undefined);
  const [rememberedIngredients, setRememberedIngredients] = useState<Ingredient[]>([]);
  const uploadEntityIdRef = useRef<string | null>(recipe?.id ?? null);
  const stepUploadEntityIdsRef = useRef<Record<string, string>>({});

  const categoriesQuery = useGetCategories({ limit: 100 }, { query: { staleTime: 5 * 60 * 1000 } });
  const tagsQuery = useGetTags({ limit: 100 }, { query: { staleTime: 5 * 60 * 1000 } });
  const ingredientsQuery = useGetIngredients({ limit: INGREDIENTS_PAGE_SIZE }, { query: { staleTime: 5 * 60 * 1000 } });

  const categories = useMemo(() => categoriesQuery.data?.data ?? [], [categoriesQuery.data?.data]);
  const recipeIngredients = useMemo(() => getRecipeIngredients(recipe), [recipe]);
  const recipeTags = useMemo(() => getRecipeTags(recipe), [recipe]);
  const tags = useMemo(
    () => mergeTags(tagsQuery.data?.data ?? [], recipeTags),
    [recipeTags, tagsQuery.data?.data],
  );
  const form = useForm<RecipeFormValues>({
    defaultValues: recipe ? mapRecipeToFormValues(recipe) : createEmptyRecipeFormValues(),
  });
  const sectionArray = useFieldArray({
    control: form.control,
    name: "sections",
  });

  useEffect(() => {
    if (!recipe) return;
    form.reset(mapRecipeToFormValues(recipe));
    uploadEntityIdRef.current = recipe.id;
  }, [form, recipe]);

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  const recipeImageUrl = useWatch({ control: form.control, name: "imageUrl" });
  const watchedTagIds = useWatch({ control: form.control, name: "tagIds" });
  const fetchedIngredients = useMemo(() => ingredientsQuery.data?.data ?? [], [ingredientsQuery.data?.data]);
  const ingredients = useMemo(
    () => mergeIngredients(fetchedIngredients, recipeIngredients, rememberedIngredients),
    [fetchedIngredients, recipeIngredients, rememberedIngredients],
  );
  const selectedTagIds = watchedTagIds ?? EMPTY_TAG_IDS;
  const selectedTags = useMemo(
    () => tags.filter((tag) => selectedTagIds.includes(tag.id)),
    [selectedTagIds, tags],
  );
  const availableTags = useMemo(
    () => tags.filter((tag) => !selectedTagIds.includes(tag.id)),
    [selectedTagIds, tags],
  );

  async function handleImageChange(file?: File) {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    setUploadPreviewUrl(previewUrl);

    try {
      const entityId = uploadEntityIdRef.current ?? crypto.randomUUID();
      uploadEntityIdRef.current = entityId;
      const signature = await signUploadMutation.mutateAsync({
        data: {
          target: "recipes",
          entityId,
        },
      });
      const uploaded = await uploadToCloudinary(file, signature);

      form.setValue("imageUrl", uploaded.secure_url, { shouldDirty: true });
      form.setValue("imagePublicId", uploaded.public_id, { shouldDirty: true });
      toast.success("Imagem adicionada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não conseguimos adicionar a foto agora.");
    }
  }

  async function handleStepImageChange(sectionIndex: number, stepIndex: number, file?: File) {
    if (!file) return;

    const stepPath = `sections.${sectionIndex}.steps.${stepIndex}` as const;
    const step = form.getValues(stepPath);
    const stepKey = `${sectionIndex}:${stepIndex}`;
    const entityId = step.id ?? stepUploadEntityIdsRef.current[stepKey] ?? crypto.randomUUID();
    stepUploadEntityIdsRef.current[stepKey] = entityId;
    setUploadingStepKey(stepKey);

    try {
      const signature = await signUploadMutation.mutateAsync({
        data: {
          target: "preparationSteps",
          entityId,
        },
      });
      const uploaded = await uploadToCloudinary(file, signature);

      form.setValue(`${stepPath}.imageUrl`, uploaded.secure_url, { shouldDirty: true });
      form.setValue(`${stepPath}.imagePublicId`, uploaded.public_id, { shouldDirty: true });
      toast.success("Imagem do passo adicionada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não conseguimos adicionar essa imagem agora.");
    } finally {
      setUploadingStepKey(null);
    }
  }

  function handleRemoveStepImage(sectionIndex: number, stepIndex: number) {
    const stepPath = `sections.${sectionIndex}.steps.${stepIndex}` as const;
    form.setValue(`${stepPath}.imageUrl`, null, { shouldDirty: true });
    form.setValue(`${stepPath}.imagePublicId`, null, { shouldDirty: true });
  }

  async function handleValidSubmit(data: RecipeFormValues) {
    try {
      const payload = buildRecipePayload(data);
      const result = await onSubmit(payload);

      if (result?.id && mode === "create") {
        router.push(`/minhas-receitas/${result.id}/editar`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Revise os campos destacados antes de salvar.");
    }
  }

  function addTag(tagId: string) {
    if (selectedTagIds.includes(tagId)) return;
    form.setValue("tagIds", [...selectedTagIds, tagId], { shouldDirty: true });
  }

  function removeTag(tagId: string) {
    form.setValue(
      "tagIds",
      selectedTagIds.filter((id) => id !== tagId),
      { shouldDirty: true },
    );
  }

  function rememberIngredient(ingredient: Ingredient) {
    setRememberedIngredients((current) => {
      if (current.some((item) => item.id === ingredient.id)) return current;
      return [...current, ingredient];
    });
  }

  return {
    form,
    sectionArray,
    categories,
    ingredients,
    selectedTags,
    availableTags,
    tagSelectValue,
    uploadingStepKey,
    uploadPreviewUrl,
    recipeImageUrl,
    submitLabel: mode === "create" ? "Salvar receita" : "Salvar mudanças",
    isSubmitting,
    isUploading: signUploadMutation.isPending,
    isLoadingCatalog: categoriesQuery.isLoading || tagsQuery.isLoading || ingredientsQuery.isLoading,
    isLoadingIngredients: ingredientsQuery.isLoading,
    isIngredientsError: ingredientsQuery.isError,
    setTagSelectValue,
    addTag,
    removeTag,
    rememberIngredient,
    handleImageChange,
    handleStepImageChange,
    handleRemoveStepImage,
    handleValidSubmit,
  };
}

export type RecipeFormController = ReturnType<typeof useRecipeFormController>;

async function uploadToCloudinary(
  file: File,
  signature: {
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
    publicId?: string | null;
    uploadUrl: string;
  },
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);
  if (signature.publicId) formData.append("public_id", signature.publicId);
  formData.append("overwrite", "true");
  formData.append("invalidate", "true");

  const uploadResponse = await fetch(signature.uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error("A imagem não foi enviada. Tente escolher a imagem novamente.");
  }

  return (await uploadResponse.json()) as CloudinaryUploadResponse;
}
