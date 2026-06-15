"use client";

import { FallbackImage as Image } from "@/components/shared/fallback-image";
import { ImagePlus, Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RecipeFormValues } from "@/lib/my-recipes/recipe-form-types";

type RecipeMainInfoCardProps = {
  form: UseFormReturn<RecipeFormValues>;
  imageUrl?: string | null;
  uploadPreviewUrl?: string | null;
  isUploadingImage: boolean;
  onImageChange: (file?: File) => void;
};

export function RecipeMainInfoCard({
  form,
  imageUrl,
  uploadPreviewUrl,
  isUploadingImage,
  onImageChange,
}: RecipeMainInfoCardProps) {
  const visibleImageUrl = uploadPreviewUrl || imageUrl;

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Sobre a receita</CardTitle>
        <CardDescription>Comece pelo nome, um resumo curto e uma boa foto.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="flex flex-col gap-4">
            <FormItem>
              <Label htmlFor="recipe-title">Nome da receita</Label>
              <Input id="recipe-title" placeholder="Ex.: Bolo de banana com aveia" {...form.register("title")} />
            </FormItem>

            <FormItem>
              <Label htmlFor="recipe-description">Resumo</Label>
              <Textarea
                id="recipe-description"
                rows={5}
                placeholder="Uma frase simples sobre sabor, ocasião ou preparo."
                {...form.register("description")}
              />
            </FormItem>
          </div>

          <label
            className={cn(
              "group relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-muted/30 text-sm text-muted-foreground transition hover:border-primary/50",
              visibleImageUrl && "border-transparent",
              isUploadingImage && "pointer-events-none opacity-80",
            )}
          >
            {visibleImageUrl && (
              <Image src={visibleImageUrl} alt="Foto da receita" fill className="object-cover" />
            )}
            {isUploadingImage ? (
              <span className="flex items-center gap-2 rounded-full bg-background/90 px-3 py-2 text-sm font-medium shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando foto
              </span>
            ) : !visibleImageUrl ? (
              <span className="flex flex-col items-center gap-2 text-center">
                <ImagePlus className="h-5 w-5" />
                Clique para escolher uma foto
              </span>
            ) : (
              <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                Trocar
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={isUploadingImage}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                onImageChange(file);
              }}
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
