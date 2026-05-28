import { useEffect, useState } from "react";
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
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [localValue, onChange, value]);

  return (
    <Input
      placeholder={placeholder}
      className={className}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
}
