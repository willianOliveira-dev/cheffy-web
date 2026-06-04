"use client";

import type { CreateMyRecipeBody, Recipe } from "@/api/generated/model";
import { useRecipeFormController } from "@/lib/my-recipes/use-recipe-form-controller";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeFormEditor } from "./recipe-form-editor";
import { RecipeNutritionPreview } from "./recipe-nutrition-preview";
import type { RecipeFormMode } from "@/lib/my-recipes/recipe-form-types";

type RecipeFormProps = {
  mode: RecipeFormMode;
  recipe?: Recipe;
  isSubmitting: boolean;
  onSubmit: (data: CreateMyRecipeBody) => Promise<Recipe | void>;
};

export function RecipeForm(props: RecipeFormProps) {
  const controller = useRecipeFormController(props);
  const editor = <RecipeFormEditor controller={controller} />;

  return (
    <Form {...controller.form}>
      <div className="lg:hidden">
        <Tabs defaultValue="edit">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Editar</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrição</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">{editor}</TabsContent>
          <TabsContent value="nutrition">
            <RecipeNutritionPreview form={controller.form} ingredients={controller.ingredients} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_29rem] lg:items-start">
        {editor}
        <aside className="sticky top-24">
          <RecipeNutritionPreview form={controller.form} ingredients={controller.ingredients} />
        </aside>
      </div>
    </Form>
  );
}
