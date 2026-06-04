import { useForm } from "@tanstack/react-form";
import { CalendarRange, Hash, Loader2, Save, Tag } from "lucide-react";

import { TenderCreateSchema, type TenderCreateInput } from "@frms/shared";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { firstFieldError } from "@/lib/form-utils";

import { useCreateTenderMutation } from "../mutations";

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n: number) =>
  new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const defaults: TenderCreateInput = {
  reference: "",
  title: "",
  description: "",
  startDate: today(),
  endDate: inDays(30),
};

export function TenderForm({ onCreated }: { onCreated?: () => void }) {
  const create = useCreateTenderMutation();

  const form = useForm({
    defaultValues: defaults,
    validators: { onSubmit: TenderCreateSchema },
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
      aria-label="Create tender"
      className="space-y-6 rounded-2xl border border-border/60 bg-card p-5 shadow-xs sm:p-6"
    >
      <FieldSet>
        <FieldLegend>Tender identity</FieldLegend>
        <FieldDescription>
          A unique reference and a clear title help suppliers identify your call quickly.
        </FieldDescription>
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field
            name="reference"
            children={(field) => {
              const err = firstFieldError(field.state.meta.errors);
              const invalid = field.state.meta.isTouched && Boolean(err);
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Reference <span aria-hidden="true" className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <Hash
                      aria-hidden="true"
                      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="TND-2026-001"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={invalid}
                      className="pl-8"
                      required
                    />
                  </div>
                  {invalid ? (
                    <FieldDescription className="text-destructive">{err}</FieldDescription>
                  ) : null}
                </Field>
              );
            }}
          />

          <form.Field
            name="title"
            children={(field) => {
              const err = firstFieldError(field.state.meta.errors);
              const invalid = field.state.meta.isTouched && Boolean(err);
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Title <span aria-hidden="true" className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <Tag
                      aria-hidden="true"
                      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Lab computers — Spring intake"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={invalid}
                      className="pl-8"
                      required
                    />
                  </div>
                  {invalid ? (
                    <FieldDescription className="text-destructive">{err}</FieldDescription>
                  ) : null}
                </Field>
              );
            }}
          />

          <form.Field
            name="description"
            children={(field) => (
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  rows={3}
                  placeholder="Scope, evaluation criteria, special requirements…"
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldDescription>Optional, but recommended for clarity.</FieldDescription>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Window</FieldLegend>
        <FieldDescription>
          The bid window during which suppliers may submit offers.
        </FieldDescription>
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field
            name="startDate"
            children={(field) => {
              const err = firstFieldError(field.state.meta.errors);
              const invalid = field.state.meta.isTouched && Boolean(err);
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Start date <span aria-hidden="true" className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <CalendarRange
                      aria-hidden="true"
                      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={invalid}
                      className="pl-8"
                      required
                    />
                  </div>
                  {invalid ? (
                    <FieldDescription className="text-destructive">{err}</FieldDescription>
                  ) : null}
                </Field>
              );
            }}
          />

          <form.Field
            name="endDate"
            children={(field) => {
              const err = firstFieldError(field.state.meta.errors);
              const invalid = field.state.meta.isTouched && Boolean(err);
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>
                    End date <span aria-hidden="true" className="text-destructive">*</span>
                  </FieldLabel>
                  <div className="relative">
                    <CalendarRange
                      aria-hidden="true"
                      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={invalid}
                      className="pl-8"
                      required
                    />
                  </div>
                  {invalid ? (
                    <FieldDescription className="text-destructive">{err}</FieldDescription>
                  ) : null}
                </Field>
              );
            }}
          />
        </FieldGroup>
      </FieldSet>

      <div className="flex justify-end border-t border-border/60 pt-5">
        <form.Subscribe
          selector={(state) => [state.isSubmitting, state.canSubmit] as const}
          children={([isSubmitting, canSubmit]) => (
            <Button type="submit" disabled={isSubmitting || !canSubmit} className="glow">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>Save tender</span>
                </>
              )}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
