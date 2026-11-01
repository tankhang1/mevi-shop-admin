import { useEffect, useState } from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";

const DEBOUNCE_MS = 300;

/**
 * Combobox whose search runs on the server: typing calls `onSearch(keyword)` (debounced)
 * and the parent feeds back `options` from its query. `selectedLabel` shows the current
 * value even when it is not in the latest result page.
 */
export function AsyncComboboxField<T extends FieldValues>({
  name,
  label,
  required,
  description,
  className,
  options,
  loading,
  onSearch,
  selectedLabel,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  emptyText = "Không tìm thấy",
  disabled,
  onChange,
}: {
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  description?: string;
  className?: string;
  options: { label: string; value: string }[];
  loading?: boolean;
  onSearch: (keyword: string) => void;
  selectedLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  onChange?: (value: string, option?: { label: string; value: string }) => void;
}) {
  const { control } = useFormContext<T>();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const t = setTimeout(() => onSearch(keyword.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const current = options.find((o) => o.value === field.value)?.label ?? selectedLabel;
        return (
          <FormItem className={className}>
            <FormLabel>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                  >
                    <span className="truncate">{field.value ? current || field.value : placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                {/* shouldFilter=false: the server already filtered by keyword */}
                <Command shouldFilter={false}>
                  <CommandInput placeholder={searchPlaceholder} value={keyword} onValueChange={setKeyword} />
                  <CommandList>
                    {loading ? (
                      <div className="flex items-center justify-center py-6 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                          {options.map((o) => (
                            <CommandItem
                              key={o.value}
                              value={o.value}
                              onSelect={() => {
                                field.onChange(o.value);
                                onChange?.(o.value, o);
                                setOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", field.value === o.value ? "opacity-100" : "opacity-0")} />
                              {o.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
