"use client";

import type { RecipeFormController } from "@/lib/my-recipes/use-recipe-form-controller";
import { RecipeDetailsCard } from "./recipe-details-card";
import { RecipeMainInfoCard } from "./recipe-main-info-card";
import { RecipeSectionsCard } from "./recipe-sections-card";
import { RecipeSubmitActions } from "./recipe-submit-actions";

type RecipeFormEditorProps = {
  controller: RecipeFormController;
};

export function RecipeFormEditor({ controller }: RecipeFormEditorProps) {
  return (
    <form
      onSubmit={controller.form.handleSubmit(controller.handleValidSubmit)}
      className="flex min-w-0 flex-col gap-6"
    >
      <RecipeMainInfoCard
        form={controller.form}
        imageUrl={controller.recipeImageUrl}
        uploadPreviewUrl={controller.uploadPreviewUrl}
        isUploadingImage={controller.isUploading}
        onImageChange={(file) => void controller.handleImageChange(file)}
      />

      <RecipeDetailsCard
        form={controller.form}
        categories={controller.categories}
        selectedTags={controller.selectedTags}
        availableTags={controller.availableTags}
        tagSelectValue={controller.tagSelectValue}
        isLoadingCatalog={controller.isLoadingCatalog}
        onTagSelect={(tagId) => {
          controller.setTagSelectValue(undefined);
          controller.addTag(tagId);
        }}
        onRemoveTag={controller.removeTag}
      />

      <RecipeSectionsCard controller={controller} />

      <RecipeSubmitActions
        submitLabel={controller.submitLabel}
        isSubmitting={controller.isSubmitting}
        isUploading={controller.isUploading}
      />
    </form>
  );
}
