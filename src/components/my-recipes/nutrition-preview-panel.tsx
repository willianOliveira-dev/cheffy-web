"use client";

import type { NutritionKey, NutritionPreview } from "@/types/nutrition-preview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type NutritionPreviewPanelProps = {
  preview: NutritionPreview;
};

const NUTRIENTS: {
  key: NutritionKey;
  label: string;
  unit: string;
  hasDailyValue?: boolean;
}[] = [
  { key: "energyKcal", label: "Energia", unit: "kcal", hasDailyValue: true },
  { key: "carbohydrates", label: "Carboidratos", unit: "g", hasDailyValue: true },
  { key: "totalSugars", label: "Açúcares totais", unit: "g" },
  { key: "addedSugars", label: "Açúcares adicionados", unit: "g", hasDailyValue: true },
  { key: "protein", label: "Proteínas", unit: "g", hasDailyValue: true },
  { key: "totalFat", label: "Gorduras totais", unit: "g", hasDailyValue: true },
  { key: "saturatedFat", label: "Gorduras saturadas", unit: "g", hasDailyValue: true },
  { key: "transFat", label: "Gorduras trans", unit: "g" },
  { key: "fiber", label: "Fibras", unit: "g", hasDailyValue: true },
  { key: "sodiumMg", label: "Sódio", unit: "mg", hasDailyValue: true },
];

export function NutritionPreviewPanel({ preview }: NutritionPreviewPanelProps) {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Tabela nutricional</CardTitle>
          <CardDescription>
            {preview.isApproximate
              ? "Os valores são uma estimativa e podem mudar quando todos os ingredientes tiverem dados nutricionais."
              : "Os valores mudam conforme você ajusta os ingredientes."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>100g</TableHead>
                <TableHead>Porção</TableHead>
                <TableHead>%VD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {NUTRIENTS.map((nutrient) => (
                <TableRow key={nutrient.key}>
                  <TableCell className="font-medium">{nutrient.label}</TableCell>
                  <TableCell>{formatNutrient(preview.totals[nutrient.key], nutrient.unit)}</TableCell>
                  <TableCell>{formatNutrient(preview.per100g[nutrient.key], nutrient.unit)}</TableCell>
                  <TableCell>{formatNutrient(preview.perServing[nutrient.key], nutrient.unit)}</TableCell>
                  <TableCell>
                    {nutrient.hasDailyValue
                      ? `${formatNumber(preview.dailyValuePercent[nutrient.key] ?? 0)}%`
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatNutrient(value: number, unit: string) {
  return `${formatNumber(value)} ${unit}`;
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) >= 100) return Math.round(value).toString();
  return (Math.round(value * 10) / 10).toString();
}
