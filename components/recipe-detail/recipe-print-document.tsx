"use client";

import { forwardRef } from "react";
import type { Recipe } from "@/api/generated/model";
import {
  formatDifficulty,
  formatMinutes,
  formatNumber,
  formatNutritionServingLabel,
  formatNutritionServingsLabel,
  formatYield,
  kcalToKj,
} from "@/lib/recipe-formatters";

type RecipePrintDocumentProps = {
  recipe: Recipe;
};

export const RecipePrintDocument = forwardRef<HTMLDivElement, RecipePrintDocumentProps>(
  function RecipePrintDocument({ recipe }, ref) {
    const sections = [...(recipe.sections ?? [])].sort((a, b) => a.position - b.position);
    const nutritionServingLabel = formatNutritionServingLabel(recipe.nutritionLabel);
    const nutritionServingsLabel = formatNutritionServingsLabel(recipe.nutritionLabel);

    return (
      <div ref={ref} className="bg-white p-10 text-black">
        <header className="border-b-4 border-black pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em]">Cheffy</p>
          <h1 className="mt-2 text-4xl font-bold">{recipe.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed">{recipe.description}</p>

          <div className="mt-5 grid grid-cols-4 gap-3 text-sm">
            <PrintStat label="Tempo total" value={formatMinutes(recipe.totalTime)} />
            <PrintStat label="Preparo" value={formatMinutes(recipe.prepTime)} />
            <PrintStat label="Rendimento" value={formatYield(recipe.yieldAmount, recipe.yieldUnit)} />
            <PrintStat label="Dificuldade" value={formatDifficulty(recipe.difficulty)} />
          </div>
        </header>

        <main className="mt-8 grid gap-8">
          <section>
            <h2 className="mb-4 border-b border-black pb-2 text-2xl font-bold">Seções da receita</h2>
            <div className="grid gap-7">
              {sections.map((section) => {
                const ingredients = [...(section.ingredients ?? [])].sort((a, b) => a.position - b.position);
                const steps = [...(section.steps ?? [])].sort((a, b) => a.position - b.position);

                return (
                  <div key={section.id} className="break-inside-avoid">
                    <h3 className="mb-3 text-xl font-bold">{section.title}</h3>

                    {ingredients.length > 0 && (
                      <div className="mb-4">
                        <h4 className="mb-2 text-sm font-bold uppercase">Ingredientes</h4>
                        <ul className="grid gap-1 text-sm">
                          {ingredients.map((item) => (
                            <li key={item.id}>• {item.displayText}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {steps.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-bold uppercase">Modo de preparo</h4>
                        <ol className="grid gap-3 text-sm">
                          {steps.map((step, index) => (
                            <li key={step.id} className="grid grid-cols-[2rem_1fr] gap-3">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black text-xs font-bold">
                                {index + 1}
                              </span>
                              <span>{step.description}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {recipe.nutritionLabel && (
            <section>
              <h2 className="mb-4 border-b border-black pb-2 text-2xl font-bold">Informação nutricional</h2>
              <p className="mb-2 text-sm">
                Porções por receita: {nutritionServingsLabel} · Porção:{" "}
                {nutritionServingLabel} · Total da receita:{" "}
                {formatPrintEnergy(recipe.nutritionLabel.totalEnergyKcal)}
              </p>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-black p-2 text-left">Nutriente</th>
                    <th className="border border-black p-2 text-left">100 g</th>
                    <th className="border border-black p-2 text-left">{nutritionServingLabel}</th>
                    <th className="border border-black p-2 text-left">%VD*</th>
                  </tr>
                </thead>
                <tbody>
                  <PrintNutritionRow
                    label="Valor energético"
                    per100g={formatPrintEnergy(recipe.nutritionLabel.energyKcalPer100g)}
                    serving={formatPrintEnergy(recipe.nutritionLabel.energyKcalPerServing)}
                    dailyValue={recipe.nutritionLabel.energyKcalDailyValuePercent}
                  />
                  <PrintNutritionRow
                    label="Carboidratos"
                    per100g={`${formatNumber(recipe.nutritionLabel.carbohydratesPer100g)} g`}
                    serving={`${formatNumber(recipe.nutritionLabel.carbohydratesPerServing)} g`}
                    dailyValue={recipe.nutritionLabel.carbohydratesDailyValuePercent}
                  />
                  <PrintNutritionRow
                    label="Proteínas"
                    per100g={`${formatNumber(recipe.nutritionLabel.proteinPer100g)} g`}
                    serving={`${formatNumber(recipe.nutritionLabel.proteinPerServing)} g`}
                    dailyValue={recipe.nutritionLabel.proteinDailyValuePercent}
                  />
                  <PrintNutritionRow
                    label="Gorduras totais"
                    per100g={`${formatNumber(recipe.nutritionLabel.totalFatPer100g)} g`}
                    serving={`${formatNumber(recipe.nutritionLabel.totalFatPerServing)} g`}
                    dailyValue={recipe.nutritionLabel.totalFatDailyValuePercent}
                  />
                  <PrintNutritionRow
                    label="Sódio"
                    per100g={`${formatNumber(recipe.nutritionLabel.sodiumMgPer100g, 0)} mg`}
                    serving={`${formatNumber(recipe.nutritionLabel.sodiumMgPerServing, 0)} mg`}
                    dailyValue={recipe.nutritionLabel.sodiumDailyValuePercent}
                  />
                </tbody>
              </table>
              <p className="mt-2 text-xs">
                *Percentual de valores diários fornecidos pela porção.
              </p>
            </section>
          )}
        </main>
      </div>
    );
  },
);

function PrintStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black p-3">
      <p className="text-xs uppercase">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function PrintNutritionRow({
  label,
  per100g,
  serving,
  dailyValue,
}: {
  label: string;
  per100g: string;
  serving: string;
  dailyValue: number | null | undefined;
}) {
  return (
    <tr>
      <td className="border border-black p-2 font-medium">{label}</td>
      <td className="border border-black p-2">{per100g}</td>
      <td className="border border-black p-2">{serving}</td>
      <td className="border border-black p-2">{dailyValue ?? "-"}</td>
    </tr>
  );
}

function formatPrintEnergy(kcal: number | null | undefined) {
  if (kcal === null || kcal === undefined) return "-";
  return `${formatNumber(kcal, 0)} kcal = ${formatNumber(kcalToKj(kcal), 0)} kJ`;
}
