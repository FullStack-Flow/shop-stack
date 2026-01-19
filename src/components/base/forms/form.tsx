import type * as React from "react";

type FormLike = {
  handleSubmit: () => void;
  validateAllFields: (mode: "blur" | "change") => Promise<unknown[]>;
  state: {
    fieldMeta: Partial<Record<string, any>>;
  };
};

type FormProps = Omit<React.ComponentProps<"form">, "onSubmit"> & {
  form: FormLike;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  multiStep?: {
    currentStep: number;
    totalSteps: number;
    fieldNamesByStep?: Record<number, readonly string[]>;
    onStepChange?: (step: number) => void;
  };
};

export function Form({ form, onSubmit, multiStep, ...props }: FormProps) {
  const handleStepSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (multiStep && multiStep.currentStep < multiStep.totalSteps) {
      const currentStepFieldNames =
        multiStep.fieldNamesByStep?.[multiStep.currentStep];

      if (currentStepFieldNames) {
        await form.validateAllFields("blur");
        await form.validateAllFields("change");

        const hasErrors = currentStepFieldNames.some(
          (fieldName) =>
            (form.state.fieldMeta[fieldName]?.errors?.length ?? 0) > 0,
        );

        if (!hasErrors) {
          multiStep.onStepChange?.(multiStep.currentStep + 1);
        }
      }
    } else {
      form.handleSubmit();
    }
  };

  return (
    <form
      {...props}
      onSubmit={(event) => {
        onSubmit?.(event);
        if (multiStep) {
          handleStepSubmit(event);
        } else {
          event.preventDefault();
          form.handleSubmit();
        }
      }}
    />
  );
}
