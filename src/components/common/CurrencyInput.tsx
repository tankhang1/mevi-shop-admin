import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Input, cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { formatVndDigits, parseVndDigits } from "@/lib/format";

function getCursorPositionAfterFormat(
  formatted: string,
  digitsBeforeCursor: number,
): number {
  if (digitsBeforeCursor <= 0) return 0;
  let digitsCount = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      digitsCount++;
      if (digitsCount === digitsBeforeCursor) {
        return i + 1;
      }
    }
  }
  return formatted.length;
}

export interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type" | "defaultValue"
  > {
  value?: number | string | null;
  onChange?: (val: number | undefined) => void;
  suffix?: React.ReactNode;
}

/**
 * Currency input formatted according to Vietnamese Dong (VND):
 * Thousands separated by "." (e.g. 100.000, 1.500.000).
 * Numeric value returned via onChange.
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      suffix = "₫",
      placeholder = "0",
      className,
      disabled,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!);

    const [displayValue, setDisplayValue] = useState(() =>
      formatVndDigits(value),
    );

    useEffect(() => {
      const formatted = formatVndDigits(value);
      setDisplayValue(formatted);
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const raw = input.value;
        const cursor = input.selectionStart ?? raw.length;

        // Count how many numeric digits were before the cursor
        const textBeforeCursor = raw.slice(0, cursor);
        const digitsBeforeCursor = (textBeforeCursor.match(/\d/g) || []).length;

        const num = parseVndDigits(raw);
        const formatted = num != null ? formatVndDigits(num) : "";

        setDisplayValue(formatted);
        onChange?.(num);

        // Restore cursor after formatting
        requestAnimationFrame(() => {
          if (inputRef.current) {
            const newCursor = getCursorPositionAfterFormat(
              formatted,
              digitsBeforeCursor,
            );
            inputRef.current.setSelectionRange(newCursor, newCursor);
          }
        });
      },
      [onChange],
    );

    return (
      <div className="relative w-full">
        <Input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          className={cn(
            "tabular-nums",
            suffix ? "pr-12!" : undefined,
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm font-medium text-muted-foreground select-none">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";
