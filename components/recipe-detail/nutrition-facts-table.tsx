"use client";

import { useMemo } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import type { RecipeNutritionLabel } from "@/api/generated/model";
import {
  formatNumber,
  formatNutritionServingLabel,
  formatNutritionServingsLabel,
  kcalToKj,
} from "@/lib/recipe-formatters";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type NutritionFactsTableProps = {
  nutrition: RecipeNutritionLabel | undefined;
};

type NutritionRow = {
  nutrient: string;
  per100g: string;
  perServing: string;
  dailyValue: string;
  isIndented?: boolean;
};

export function NutritionFactsTable({ nutrition }: NutritionFactsTableProps) {
  const rows = useMemo(() => buildNutritionRows(nutrition), [nutrition]);
  const servingLabel = formatNutritionServingLabel(nutrition);
  const servingsLabel = formatNutritionServingsLabel(nutrition);
  const columns = useMemo<ColumnDef<NutritionRow>[]>(
    () => [
      {
        accessorKey: "nutrient",
        header: "Informação nutricional",
        cell: ({ row }) => (
          <span className={row.original.isIndented ? "pl-4 text-muted-foreground" : "font-medium"}>
            {row.original.nutrient}
          </span>
        ),
      },
      {
        accessorKey: "per100g",
        header: "100 g",
      },
      {
        accessorKey: "perServing",
        header: servingLabel,
      },
      {
        accessorKey: "dailyValue",
        header: "%VD*",
      },
    ],
    [servingLabel],
  );

  // TanStack Table exposes runtime methods; this component does not pass them to memoized children.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!nutrition) {
    return (
      <section id="nutricao" className="flex flex-col gap-5">
        <SectionHeading />
        <Alert>
          <Info />
          <AlertTitle>Informação nutricional indisponível</AlertTitle>
          <AlertDescription>
            A receita ainda não possui dados nutricionais calculados.
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  return (
    <section id="nutricao" className="flex flex-col gap-5">
      <SectionHeading />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="uppercase tracking-wide">Informação nutricional</CardTitle>
          <p className="text-sm text-muted-foreground">
            Porções por receita: {servingsLabel} · Porção: {servingLabel}
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <Table className="border text-sm">
            <TableCaption>
              Modelo com colunas por 100 g, porção e %VD, alinhado à rotulagem nutricional vigente da ANVISA.
            </TableCaption>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-foreground/70 hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="border border-foreground/30 font-bold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="border border-foreground/20">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            *Percentual de valores diários fornecidos pela porção. Valores diários de referência com base em uma dieta de
            2.000 kcal ou 8.400 kJ. Seus valores diários podem ser maiores ou menores dependendo das suas necessidades
            energéticas.
          </p>

          {nutrition.isApproximate && (
            <Alert className="mt-4">
              <Info />
              <AlertTitle>Cálculo aproximado</AlertTitle>
              <AlertDescription>
                Os valores nutricionais são estimativas calculadas a partir dos ingredientes cadastrados.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function SectionHeading() {
  return (
    <div>
      <h2 className="font-heading text-3xl font-bold tracking-tight">Tabela nutricional</h2>
    </div>
  );
}

function buildNutritionRows(nutrition: RecipeNutritionLabel | undefined): NutritionRow[] {
  if (!nutrition) return [];

  return [
    {
      nutrient: "Valor energético",
      per100g: formatEnergy(nutrition.energyKcalPer100g),
      perServing: formatEnergy(nutrition.energyKcalPerServing),
      dailyValue: formatDailyValue(nutrition.energyKcalDailyValuePercent),
    },
    {
      nutrient: "Carboidratos",
      per100g: `${formatNumber(nutrition.carbohydratesPer100g)} g`,
      perServing: `${formatNumber(nutrition.carbohydratesPerServing)} g`,
      dailyValue: formatDailyValue(nutrition.carbohydratesDailyValuePercent),
    },
    {
      nutrient: "Açúcares totais",
      per100g: `${formatNumber(nutrition.totalSugarsPer100g)} g`,
      perServing: `${formatNumber(nutrition.totalSugarsPerServing)} g`,
      dailyValue: "-",
      isIndented: true,
    },
    {
      nutrient: "Açúcares adicionados",
      per100g: `${formatNumber(nutrition.addedSugarsPer100g)} g`,
      perServing: `${formatNumber(nutrition.addedSugarsPerServing)} g`,
      dailyValue: formatDailyValue(nutrition.addedSugarsDailyValuePercent),
      isIndented: true,
    },
    {
      nutrient: "Proteínas",
      per100g: `${formatNumber(nutrition.proteinPer100g)} g`,
      perServing: `${formatNumber(nutrition.proteinPerServing)} g`,
      dailyValue: formatDailyValue(nutrition.proteinDailyValuePercent),
    },
    {
      nutrient: "Gorduras totais",
      per100g: `${formatNumber(nutrition.totalFatPer100g)} g`,
      perServing: `${formatNumber(nutrition.totalFatPerServing)} g`,
      dailyValue: formatDailyValue(nutrition.totalFatDailyValuePercent),
    },
    {
      nutrient: "Gorduras saturadas",
      per100g: `${formatNumber(nutrition.saturatedFatPer100g)} g`,
      perServing: `${formatNumber(nutrition.saturatedFatPerServing)} g`,
      dailyValue: formatDailyValue(nutrition.saturatedFatDailyValuePercent),
    },
    {
      nutrient: "Gorduras trans",
      per100g: `${formatNumber(nutrition.transFatPer100g)} g`,
      perServing: `${formatNumber(nutrition.transFatPerServing)} g`,
      dailyValue: "-",
    },
    {
      nutrient: "Fibra alimentar",
      per100g: `${formatNumber(nutrition.fiberPer100g)} g`,
      perServing: `${formatNumber(nutrition.fiberPerServing)} g`,
      dailyValue: formatDailyValue(nutrition.fiberDailyValuePercent),
    },
    {
      nutrient: "Sódio",
      per100g: `${formatNumber(nutrition.sodiumMgPer100g, 0)} mg`,
      perServing: `${formatNumber(nutrition.sodiumMgPerServing, 0)} mg`,
      dailyValue: formatDailyValue(nutrition.sodiumDailyValuePercent),
    },
  ];
}

function formatEnergy(kcal: number | null | undefined) {
  if (kcal === null || kcal === undefined) return "-";

  return `${formatNumber(kcal, 0)} kcal = ${formatNumber(kcalToKj(kcal), 0)} kJ`;
}

function formatDailyValue(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return `${formatNumber(value, 0)}`;
}
