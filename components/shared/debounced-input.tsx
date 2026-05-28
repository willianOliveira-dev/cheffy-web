import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

export function DebouncedSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (nextValue !== value) onChange(nextValue);
    }, 500);
  };

  return (
    <Input
      key={value}
      placeholder={placeholder}
      className={className}
      defaultValue={value}
      onChange={handleChange}
    />
  );
}
