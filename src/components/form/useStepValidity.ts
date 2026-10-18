import { useMemo } from "react";
import { useWatch, type Control, type FieldValues } from "react-hook-form";
import type { ZodType } from "zod";

/**
 * Live validity per step for the library `StepperForm` (`step.isValid`).
 * A step is valid when the schema reports no issue under any of its field
 * prefixes, so the rules stay in the zod schema.
 */
export function useStepValidity<T extends FieldValues>(
  control: Control<T>,
  schema: ZodType,
  stepFields: string[][],
): boolean[] {
  const values = useWatch({ control });
  const fieldsKey = JSON.stringify(stepFields);

  return useMemo(() => {
    const result = schema.safeParse(values);
    if (result.success) return stepFields.map(() => true);

    const paths = result.error.issues.map((i) => i.path.join("."));
    return stepFields.map(
      (fields) =>
        !paths.some((path) =>
          fields.some((f) => path === f || path.startsWith(`${f}.`)),
        ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by content
  }, [values, schema, fieldsKey]);
}
