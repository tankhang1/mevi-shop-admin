import type { ReactNode } from "react";
import { type FieldPath, type FieldValues, useFormContext } from "react-hook-form";
import {
  Combobox,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";

interface BaseProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  description?: ReactNode;
  className?: string;
}

function Label({ label, required }: { label: string; required?: boolean }) {
  return (
    <FormLabel>
      {label}
      {required && <span className="text-destructive"> *</span>}
    </FormLabel>
  );
}

export function TextField<T extends FieldValues>({
  name,
  label,
  required,
  description,
  className,
  type = "text",
  placeholder,
  suffix,
}: BaseProps<T> & { type?: string; placeholder?: string; suffix?: ReactNode }) {
  const { control } = useFormContext<T>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <Label label={label} required={required} />
          <FormControl>
            <div className="relative">
              <Input
                type={type}
                placeholder={placeholder}
                {...field}
                value={field.value ?? ""}
                className={suffix ? "pr-20! [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" : undefined}
              />
              {/* right-9 leaves room for eco-shared-ui Input's clear (x) button */}
              {suffix && (
                <span className="pointer-events-none absolute inset-y-0 right-9 flex items-center text-sm text-muted-foreground">
                  {suffix}
                </span>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  required,
  description,
  className,
  rows = 4,
  placeholder,
}: BaseProps<T> & { rows?: number; placeholder?: string }) {
  const { control } = useFormContext<T>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <Label label={label} required={required} />
          <FormControl>
            <Textarea rows={rows} placeholder={placeholder} {...field} value={field.value ?? ""} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  required,
  description,
  className,
  options,
  placeholder = "Chọn...",
}: BaseProps<T> & { options: { label: string; value: string }[]; placeholder?: string }) {
  const { control } = useFormContext<T>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <Label label={label} required={required} />
          <Select value={field.value ?? ""} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Searchable select (eco-shared-ui `Combobox`) for long option lists */
export function ComboboxField<T extends FieldValues>({
  name,
  label,
  required,
  description,
  className,
  options,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  emptyText = "Không tìm thấy",
  disabled,
  onChange,
}: BaseProps<T> & {
  options: { label: string; value: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  const { control } = useFormContext<T>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <Label label={label} required={required} />
          <FormControl>
            <Combobox
              options={options}
              value={field.value ?? ""}
              onChange={(val: string) => {
                field.onChange(val);
                onChange?.(val);
              }}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              emptyText={emptyText}
              disabled={disabled}
              className="w-full"
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SwitchField<T extends FieldValues>({
  name,
  label,
  description,
  className,
}: Omit<BaseProps<T>, "required">) {
  const { control } = useFormContext<T>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex items-center justify-between rounded-xl border p-3.5 shadow-xs">
            <div className="space-y-0.5 pr-4">
              <FormLabel className="text-base font-semibold">{label}</FormLabel>
              {description && <FormDescription className="text-xs">{description}</FormDescription>}
            </div>
            <FormControl>
              <Switch checked={!!field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

