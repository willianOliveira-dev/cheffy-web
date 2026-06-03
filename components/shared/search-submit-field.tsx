import { Search } from "lucide-react";
import { Control, FieldValues, Path } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchSubmitFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  placeholder: string;
  ariaLabel: string;
  onSubmit: () => void;
  inputClassName?: string;
};

export function SearchSubmitField<TFieldValues extends FieldValues>({
  control,
  name,
  placeholder,
  ariaLabel,
  onSubmit,
  inputClassName,
}: SearchSubmitFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full flex-1">
          <FormControl>
            <div className="relative">
              <Input
                type="search"
                enterKeyHint="search"
                placeholder={placeholder}
                className={cn("w-full pr-11", inputClassName)}
                value={field.value ?? ""}
                onChange={field.onChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSubmit();
                  }
                }}
              />
              <Button
                type="button"
                size="icon-sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full"
                aria-label={ariaLabel}
                onClick={onSubmit}
              >
                <Search data-icon="inline-start" />
              </Button>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
