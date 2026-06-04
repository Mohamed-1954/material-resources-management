import { useForm } from "@tanstack/react-form";

import { DepartmentCreateSchema, type DepartmentCreateInput } from "@frms/shared";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useCreateDepartmentMutation } from "../mutations";

const defaults: DepartmentCreateInput = { name: "", code: "" };

function firstError(errors: unknown[]): string | null {
  if (!errors.length) return null;
  for (const e of errors) {
    if (typeof e === "string") return e;
    if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
      return (e as { message: string }).message;
    }
  }
  return null;
}

export function DepartmentForm({ onCreated }: { onCreated?: () => void }) {
  const create = useCreateDepartmentMutation();

  const form = useForm({
    defaultValues: defaults,
    validators: { onSubmit: DepartmentCreateSchema },
    onSubmit: async ({ value, formApi }) => {
      await create.mutateAsync(value);
      formApi.reset();
      onCreated?.();
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      noValidate
      aria-label="Create department"
    >
      <FieldGroup className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
        <form.Field
          name="name"
          children={(field) => {
            const err = firstError(field.state.meta.errors);
            const invalid = field.state.meta.isTouched && Boolean(err);
            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={invalid}
                  required
                />
                {invalid ? (
                  <p role="alert" className="text-xs text-destructive">
                    {err}
                  </p>
                ) : null}
              </Field>
            );
          }}
        />
        <form.Field
          name="code"
          children={(field) => {
            const err = firstError(field.state.meta.errors);
            const invalid = field.state.meta.isTouched && Boolean(err);
            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name}>Code</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={invalid}
                  required
                />
                {invalid ? (
                  <p role="alert" className="text-xs text-destructive">
                    {err}
                  </p>
                ) : null}
              </Field>
            );
          }}
        />
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Add department"}
        </Button>
      </FieldGroup>
    </form>
  );
}
