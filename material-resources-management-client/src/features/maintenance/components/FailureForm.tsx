import { useForm } from "@tanstack/react-form";
import { Loader2, Wrench } from "lucide-react";

import {
  FAILURE_FREQUENCY,
  FAILURE_TYPE,
  FailureCreateSchema,
  type FailureCreateInput,
  type ResourceAssignmentDto,
} from "@frms/shared";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { firstFieldError } from "@/lib/form-utils";

import { useCreateFailureMutation } from "../mutations";

interface FailureFormProps {
  assignments: readonly ResourceAssignmentDto[];
}

const HUMAN_FREQUENCY: Record<string, string> = {
  RARE: "Rare",
  FREQUENT: "Frequent",
  PERMANENT: "Permanent",
};

const HUMAN_TYPE: Record<string, string> = {
  HARDWARE: "Hardware",
  SOFTWARE_SYSTEM: "Software · system",
  SOFTWARE_UTILITY: "Software · utility",
};

const defaults: FailureCreateInput = {
  resourceId: "",
  description: "",
  type: undefined,
  frequency: undefined,
};

export function FailureForm({ assignments }: FailureFormProps) {
  const create = useCreateFailureMutation();

  const form = useForm({
    defaultValues: defaults,
    validators: { onSubmit: FailureCreateSchema },
    onSubmit: async ({ value, formApi }) => {
      await create.mutateAsync({
        resourceId: value.resourceId,
        description: value.description,
        type: value.type,
        frequency: value.frequency,
      });
      formApi.reset();
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      noValidate
      aria-label="Report failure"
      className="space-y-6 rounded-2xl border border-border/60 bg-card p-5 shadow-xs sm:p-6"
    >
      <FieldSet>
        <FieldLegend>Failure details</FieldLegend>
        <FieldDescription>
          Pick the resource you are reporting, then provide a short description so a
          technician can pick up the case.
        </FieldDescription>
        <FieldGroup>
          <form.Field
            name="resourceId"
            children={(field) => {
              const err = firstFieldError(field.state.meta.errors);
              const invalid = field.state.meta.isTouched && Boolean(err);
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Resource <span aria-hidden="true" className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value || undefined}
                    onValueChange={(v) => field.handleChange(v ?? "")}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={invalid}
                      className="h-10 w-full"
                    >
                      <SelectValue placeholder="Pick a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignments.length === 0 ? (
                        <div className="px-2 py-2 text-xs text-muted-foreground">
                          No resources assigned to you yet
                        </div>
                      ) : (
                        assignments.map((a) => (
                          <SelectItem key={a.id} value={a.resourceId}>
                            <span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                #{a.resourceId.slice(0, 8)}
                              </span>
                              <span className="ml-1 text-muted-foreground/80">
                                · {a.targetType === "USER" ? "Personal" : "Department"}
                              </span>
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {invalid ? (
                    <FieldDescription className="text-destructive">{err}</FieldDescription>
                  ) : null}
                </Field>
              );
            }}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field
              name="type"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value ?? ""}
                    onValueChange={(v) =>
                      field.handleChange(v ? (v as FailureCreateInput["type"]) : undefined)
                    }
                  >
                    <SelectTrigger id={field.name} className="h-10 w-full">
                      <SelectValue placeholder="Unknown — diagnose later" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(FAILURE_TYPE).map((t) => (
                        <SelectItem key={t} value={t}>
                          {HUMAN_TYPE[t] ?? t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>Leave blank if unsure.</FieldDescription>
                </Field>
              )}
            />

            <form.Field
              name="frequency"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Frequency</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value ?? ""}
                    onValueChange={(v) =>
                      field.handleChange(v ? (v as FailureCreateInput["frequency"]) : undefined)
                    }
                  >
                    <SelectTrigger id={field.name} className="h-10 w-full">
                      <SelectValue placeholder="How often it happens" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(FAILURE_FREQUENCY).map((f) => (
                        <SelectItem key={f} value={f}>
                          {HUMAN_FREQUENCY[f] ?? f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>Leave blank if unsure.</FieldDescription>
                </Field>
              )}
            />
          </div>

          <form.Field
            name="description"
            children={(field) => {
              const err = firstFieldError(field.state.meta.errors);
              const invalid = field.state.meta.isTouched && Boolean(err);
              return (
                <Field data-invalid={invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Description <span aria-hidden="true" className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    rows={4}
                    placeholder="Briefly describe the issue — when it happens, error messages, anything else useful for the technician."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={invalid}
                  />
                  {invalid ? (
                    <FieldDescription className="text-destructive">{err}</FieldDescription>
                  ) : (
                    <FieldDescription>Be specific — it speeds up triage.</FieldDescription>
                  )}
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
                  <span>Reporting…</span>
                </>
              ) : (
                <>
                  <Wrench className="size-3.5" />
                  <span>Report failure</span>
                </>
              )}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
