import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { ZodType } from "zod";
import { Form, StepperForm, type Step } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { useStepValidity } from "./useStepValidity";

export interface SchemaStep<T extends FieldValues> {
  id: string;
  title: string;
  description?: string;
  /** Top-level fields that must be valid before "Tiếp theo" is enabled */
  fields: (keyof T & string)[];
  content: ReactNode;
}

interface Props<T extends FieldValues> {
  form: UseFormReturn<T>;
  schema: ZodType;
  steps: SchemaStep<T>[];
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: T) => void;
  onCancel: () => void;
}

/**
 * Library `StepperForm` + react-hook-form + zod: each step's "Tiếp theo" is enabled
 * only when the schema has no issue for that step's fields.
 */
export function SchemaStepperForm<T extends FieldValues>({
  form,
  schema,
  steps,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: Props<T>) {
  const validity = useStepValidity(form.control, schema, steps.map((s) => s.fields));

  const stepperSteps: Step[] = steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    isValid: validity[index],
    content: (
      <div className="space-y-4">
        {step.content}
        {!validity[index] && (
          <p className="text-xs text-muted-foreground">
            Điền đủ và đúng các trường bắt buộc (<span className="text-destructive">*</span>) để tiếp tục.
          </p>
        )}
      </div>
    ),
  }));

  return (
    <Form {...form}>
      <StepperForm
        steps={stepperSteps}
        onComplete={form.handleSubmit(onSubmit)}
        onCancel={onCancel}
        loading={isSubmitting}
        completeLabel={submitLabel}
      />
    </Form>
  );
}
