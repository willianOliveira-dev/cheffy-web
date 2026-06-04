import type { RecipeSection } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type RecipeDetailSectionNavProps = {
  sections: RecipeSection[];
};

export function RecipeDetailSectionNav({ sections }: RecipeDetailSectionNavProps) {
  return (
    <Card>
      <CardContent className="flex flex-wrap gap-2 py-4">
        {sections.map((section) => (
          <Button key={section.id} asChild variant="ghost" size="sm" className="rounded-full">
            <a href={`#secao-${section.id}`}>{section.title}</a>
          </Button>
        ))}
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <a href="#nutricao">Nutrição</a>
        </Button>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <a href="#assistente">Assistente IA</a>
        </Button>
      </CardContent>
    </Card>
  );
}
