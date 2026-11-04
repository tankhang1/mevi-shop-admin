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

export interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "defaultValue"
> {
  value?: number | string | null;
  onChange?: (val: number | undefined) => void;
  suffix?: React.ReactNode;
}

/**
 * Currency input formatted according to Vietnamese Dong (VND):
 * - Cho phép xoá sạch tất cả ký tự về rỗng ("").
 * - Phân cách hàng nghìn bằng dấu "." khi đạt từ 1.000 trở lên.
 * - Cho phép Backspace / Delete tự nhiên qua các dấu phân cách ".".
 * - Trả về giá trị kiểu number (hoặc undefined khi để trống).
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
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!);

    const [displayValue, setDisplayValue] = useState(() => {
      if (value === undefined || value === null || value === "") return "";
      return formatVndDigits(value);
    });

    // Đồng bộ giá trị prop từ bên ngoài
    useEffect(() => {
      const isFocused = inputRef.current === document.activeElement;

      if (isFocused) {
        const liveVal = inputRef.current?.value ?? "";
        const currentDigits = liveVal.replace(/\D/g, "");
        const incomingDigits =
          value === undefined || value === null || value === ""
            ? ""
            : String(value).replace(/\D/g, "");

        // Người dùng đang chủ động xoá trống input thì không tự ý điền lại số
        if (
          currentDigits === "" &&
          (incomingDigits === "" || incomingDigits === "0")
        ) {
          return;
        }

        // Nếu giá trị số học tương đương thì không ghi đè displayValue để giữ vị trí con trỏ
        if (currentDigits === incomingDigits) {
          return;
        }
      }

      if (value === undefined || value === null || value === "") {
        setDisplayValue("");
      } else {
        setDisplayValue(formatVndDigits(value));
      }
    }, [value]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;

        const input = e.currentTarget;
        const { selectionStart, selectionEnd, value: currentVal } = input;

        if (selectionStart == null || selectionEnd == null) return;
        if (selectionStart !== selectionEnd) return;

        if (e.key === "Backspace") {
          // Khi con trỏ đứng ngay sau dấu "." (ví dụ "100.|000"),
          // nhấn Backspace sẽ xoá số liền trước dấu "." thay vì chỉ xoá dấu "." rồi bị format giam lại
          if (selectionStart > 0 && currentVal[selectionStart - 1] === ".") {
            e.preventDefault();
            const deleteIdx = selectionStart - 2;
            if (deleteIdx >= 0) {
              const nextVal =
                currentVal.slice(0, deleteIdx) +
                currentVal.slice(selectionStart - 1);
              const digits = nextVal.replace(/\D/g, "");
              if (!digits) {
                setDisplayValue("");
                onChange?.(undefined);
                return;
              }
              const num = Number(digits);
              const formatted = formatVndDigits(num);
              const textBefore = currentVal.slice(0, deleteIdx);
              const digitsBefore = (textBefore.match(/\d/g) || []).length;

              setDisplayValue(formatted);
              onChange?.(num);

              requestAnimationFrame(() => {
                if (inputRef.current) {
                  const newPos = getCursorPositionAfterFormat(
                    formatted,
                    digitsBefore,
                  );
                  inputRef.current.setSelectionRange(newPos, newPos);
                }
              });
            }
          }
        } else if (e.key === "Delete") {
          // Khi con trỏ đứng ngay trước dấu "." (ví dụ "100|.000"),
          // nhấn Delete sẽ xoá số liền sau dấu "."
          if (
            selectionStart < currentVal.length &&
            currentVal[selectionStart] === "."
          ) {
            e.preventDefault();
            const deleteIdx = selectionStart + 1;
            if (deleteIdx < currentVal.length) {
              const nextVal =
                currentVal.slice(0, selectionStart) +
                currentVal.slice(deleteIdx + 1);
              const digits = nextVal.replace(/\D/g, "");
              if (!digits) {
                setDisplayValue("");
                onChange?.(undefined);
                return;
              }
              const num = Number(digits);
              const formatted = formatVndDigits(num);
              const textBefore = currentVal.slice(0, selectionStart);
              const digitsBefore = (textBefore.match(/\d/g) || []).length;

              setDisplayValue(formatted);
              onChange?.(num);

              requestAnimationFrame(() => {
                if (inputRef.current) {
                  const newPos = getCursorPositionAfterFormat(
                    formatted,
                    digitsBefore,
                  );
                  inputRef.current.setSelectionRange(newPos, newPos);
                }
              });
            }
          }
        }
      },
      [onChange, onKeyDown],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const raw = input.value;
        const cursor = input.selectionStart ?? raw.length;

        // Chỉ giữ lại chữ số
        const digits = raw.replace(/\D/g, "");

        // Cho phép xoá sạch toàn bộ
        if (!digits) {
          setDisplayValue("");
          onChange?.(undefined);
          return;
        }

        // Đếm số chữ số đứng trước vị trí con trỏ
        const textBeforeCursor = raw.slice(0, cursor);
        const digitsBeforeCursor = (textBeforeCursor.match(/\d/g) || []).length;

        const num = Number(digits);
        const formatted = formatVndDigits(num);

        setDisplayValue(formatted);
        onChange?.(num);

        // Khôi phục vị trí con trỏ sau khi format
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

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        if (!displayValue || displayValue.trim() === "") {
          setDisplayValue("");
          onChange?.(undefined);
        } else {
          const num = parseVndDigits(displayValue);
          if (num != null) {
            setDisplayValue(formatVndDigits(num));
            onChange?.(num);
          } else {
            setDisplayValue("");
            onChange?.(undefined);
          }
        }
        onBlur?.(e);
      },
      [displayValue, onChange, onBlur],
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
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={cn(
            "tabular-nums",
            suffix ? "pr-12!" : undefined,
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-sm font-medium text-muted-foreground select-none">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";
