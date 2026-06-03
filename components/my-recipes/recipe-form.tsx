"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { CreateMyRecipeBody, Ingredient, Recipe } from "@/api/generated/model";
import { useGetCategories } from "@/api/generated/categories/categories";
import { useGetIngredients } from "@/api/generated/ingredients/ingredients";
import { useSignUpload } from "@/api/generated/storage/storage";
import { useGetTags } from "@/api/generated/tags/tags";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeDetailsCard } from "./recipe-details-card";
import { RecipeNutritionPreview } from "./recipe-nutrition-preview";
import { RecipeMainInfoCard } from "./recipe-main-info-card";
import { SectionEditor } from "./recipe-section-editor";
import { RecipeSubmitActions } from "./recipe-submit-actions";
import { EMPTY_TAG_IDS, INGREDIENTS_PAGE_SIZE } from "./recipe-form-constants";
import { buildRecipePayload, mergeIngredients } from "./recipe-form-helpers";
import {
  createEmptyRecipeFormValues,
  createEmptySection,
  mapRecipeToFormValues,
  type RecipeFormMode,
  type RecipeFormValues,
} from "./recipe-form-types";

type RecipeFormProps = {
  mode: RecipeFormMode;
  recipe?: Recipe;
  isSubmitting: boolean;
  onSubmit: (data: CreateMyRecipeBody) => Promise<Recipe | void>;
};

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

export function RecipeForm({ mode, recipe, isSubmitting, onSubmit }: RecipeFormProps) {
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
  const tags = useMemo(() => tagsQuery.data?.data ?? [], [tagsQuery.data?.data]);
  const fetchedIngredients = useMemo(() => ingredientsQuery.data?.data ?? [], [ingredientsQuery.data?.data]);
  const ingredients = useMemo(
    () => mergeIngredients(fetchedIngredients, rememberedIngredients),
    [fetchedIngredients, rememberedIngredients],
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
  const selectedTagIds = watchedTagIds ?? EMPTY_TAG_IDS;
  const selectedTags = useMemo(
    () => tags.filter((tag) => selectedTagIds.includes(tag.id)),
    [selectedTagIds, tags],
  );
  const availableTags = useMemo(
    () => tags.filter((tag) => !selectedTagIds.includes(tag.id)),
    [selectedTagIds, tags],
  );

  const isLoadingCatalog = categoriesQuery.isLoading || tagsQuery.isLoading || ingredientsQuery.isLoading;
  const submitLabel = mode === "create" ? "Salvar receita" : "Salvar mudanças";

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
        throw new Error("A foto não foi enviada. Tente escolher a imagem novamente.");
      }

      const uploaded = (await uploadResponse.json()) as CloudinaryUploadResponse;
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
        throw new Error("A imagem do passo não foi enviada. Tente escolher outra foto.");
      }

      const uploaded = (await uploadResponse.json()) as CloudinaryUploadResponse;
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

  const editor = (
    <form onSubmit={form.handleSubmit(handleValidSubmit)} className="flex min-w-0 flex-col gap-6">
      <RecipeMainInfoCard
        form={form}
        imageUrl={recipeImageUrl}
        uploadPreviewUrl={uploadPreviewUrl}
        isUploadingImage={signUploadMutation.isPending}
        onImageChange={(file) => void handleImageChange(file)}
      />

      <RecipeDetailsCard
        form={form}
        categories={categories}
        selectedTags={selectedTags}
        availableTags={availableTags}
        tagSelectValue={tagSelectValue}
        isLoadingCatalog={isLoadingCatalog}
        onTagSelect={(tagId) => {
          setTagSelectValue(undefined);
          addTag(tagId);
        }}
        onRemoveTag={removeTag}
      />

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl">Ingredientes e preparo</CardTitle>
            <CardDescription>Liste os ingredientes e explique o preparo em passos simples.</CardDescription>
          </div>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => sectionArray.append(createEmptySection(sectionArray.fields.length))}>
            <Plus data-icon="inline-start" />
            Nova etapa
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {sectionArray.fields.map((section, sectionIndex) => (
            <SectionEditor
              key={section.id}
              form={form}
              sectionIndex={sectionIndex}
              sectionsCount={sectionArray.fields.length}
              ingredients={ingredients as Ingredient[]}
              isLoadingIngredients={ingredientsQuery.isLoading}
              isIngredientsError={ingredientsQuery.isError}
              onRememberIngredient={rememberIngredient}
              uploadingStepKey={uploadingStepKey}
              onUploadStepImage={handleStepImageChange}
              onRemoveStepImage={handleRemoveStepImage}
              onMoveSection={(direction) => sectionArray.move(sectionIndex, sectionIndex + direction)}
              onRemoveSection={() => sectionArray.remove(sectionIndex)}
            />
          ))}
        </CardContent>
      </Card>

      <RecipeSubmitActions
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        isUploading={signUploadMutation.isPending}
      />
    </form>
  );

  return (
    <Form {...form}>
      <div className="lg:hidden">
        <Tabs defaultValue="edit">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Editar</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrição</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">{editor}</TabsContent>
          <TabsContent value="nutrition">
            <RecipeNutritionPreview form={form} ingredients={ingredients as Ingredient[]} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_29rem] lg:items-start">
        {editor}
        <aside className="sticky top-24">
          <RecipeNutritionPreview form={form} ingredients={ingredients as Ingredient[]} />
        </aside>
      </div>
    </Form>
  );

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
}

