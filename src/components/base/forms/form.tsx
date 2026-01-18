import type * as React from "react";

type FormLike = {
  handleSubmit: () => void;
};

type FormProps = Omit<React.ComponentProps<"form">, "onSubmit"> & {
  form: FormLike;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function Form({ form, onSubmit, ...props }: FormProps) {
  return (
    <form
      {...props}
      onSubmit={(event) => {
        onSubmit?.(event);
        event.preventDefault();
        form.handleSubmit();
      }}
    />
  );
}
