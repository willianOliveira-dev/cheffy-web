import { useGetCategories } from "@/api/generated/categories/categories";
import { useGetTags } from "@/api/generated/tags/tags";
import { GetRecipesDifficulty } from "@/api/generated/model";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SearchFilters() {
  const { data: categoriesData, isLoading: loadingCategories } = useGetCategories({ limit: 100 });
  const { data: tagsData, isLoading: loadingTags } = useGetTags({ limit: 100 });
  const dynamicAccordionContentClassName = "h-auto pb-4";
  const listScrollClassName = "h-80 pr-3 md:h-96";
  const optionItemClassName = "flex min-h-9 items-center gap-3";

  return (
    <div className="flex flex-col gap-6">
      <Accordion type="multiple" defaultValue={["category", "difficulty", "time", "tag"]} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-base font-semibold">Categoria</AccordionTrigger>
          <AccordionContent className={dynamicAccordionContentClassName}>
            {loadingCategories ? (
              <div className="space-y-3 pt-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <ScrollArea className={listScrollClassName}>
                <FormField
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          className="flex flex-col gap-2.5 pb-6 pt-1"
                        >
                          <FormItem className={optionItemClassName}>
                            <FormControl>
                              <RadioGroupItem value="" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-muted-foreground">
                              Todas as categorias
                            </FormLabel>
                          </FormItem>
                          {categoriesData?.data?.map((category) => (
                            <FormItem key={category.id} className={optionItemClassName}>
                              <FormControl>
                                <RadioGroupItem value={category.id} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer hover:text-primary transition-colors">
                                {category.name}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </ScrollArea>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="difficulty">
          <AccordionTrigger className="text-base font-semibold">Dificuldade</AccordionTrigger>
          <AccordionContent className="pt-2">
            <FormField
              name="difficulty"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      className="grid grid-cols-2 gap-2"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="" className="peer sr-only" />
                        </FormControl>
                        <FormLabel className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary">
                          Todos
                        </FormLabel>
                      </FormItem>
                      {[
                        { value: GetRecipesDifficulty.EASY, label: "Fácil" },
                        { value: GetRecipesDifficulty.MEDIUM, label: "Médio" },
                        { value: GetRecipesDifficulty.HARD, label: "Difícil" },
                        { value: GetRecipesDifficulty.EXPERT, label: "Expert" },
                      ].map((diff) => (
                        <FormItem key={diff.value}>
                          <FormControl>
                            <RadioGroupItem value={diff.value} className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary">
                            {diff.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="time">
          <AccordionTrigger className="text-base font-semibold">Tempo Máximo</AccordionTrigger>
          <AccordionContent className="pt-4 pb-2 px-2">
            <FormField
              name="maxTotalTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Slider
                      min={0}
                      max={180}
                      step={15}
                      defaultValue={[field.value || 180]}
                      onValueChange={(vals) => field.onChange(vals[0] === 180 ? undefined : vals[0])}
                    />
                  </FormControl>
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground font-medium">
                    <span>Qualquer</span>
                    <span>{field.value && field.value < 180 ? `${field.value} min` : 'Sem limite'}</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tag">
          <AccordionTrigger className="text-base font-semibold">Tags</AccordionTrigger>
          <AccordionContent className={dynamicAccordionContentClassName}>
            {loadingTags ? (
              <div className="space-y-3 pt-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <ScrollArea className={listScrollClassName}>
                <FormField
                  name="tagId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          className="flex flex-col gap-2.5 pb-6 pt-1"
                        >
                          <FormItem className={optionItemClassName}>
                            <FormControl>
                              <RadioGroupItem value="" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-muted-foreground">
                              Todas as tags
                            </FormLabel>
                          </FormItem>
                          {tagsData?.data?.map((tag) => (
                            <FormItem key={tag.id} className={optionItemClassName}>
                              <FormControl>
                                <RadioGroupItem value={tag.id} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer hover:text-primary transition-colors">
                                #{tag.name}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </ScrollArea>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
