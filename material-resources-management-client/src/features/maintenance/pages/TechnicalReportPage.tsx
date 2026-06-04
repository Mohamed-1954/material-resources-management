import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { CalendarRange, Loader2, Save } from "lucide-react";

import {
  FAILURE_FREQUENCY,
  FAILURE_TYPE,
  TechnicalReportSchema,
  type FailureFrequency,
  type FailureType,
  type TechnicalReportInput,
} from "@frms/shared";

import { PageHeader } from "@/components/layout/PageHeader";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { firstFieldError } from "@/lib/form-utils";

import { useTechnicalReportMutation } from "../mutations";

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

export function TechnicalReportPage({ failureId }: { failureId: string }) {
  const navigate = useNavigate();
  const submit = useTechnicalReportMutation();

  const defaults: TechnicalReportInput = {
    explanation: "",
    appearedAt: new Date().toISOString().slice(0, 10),
    frequency: FAILURE_FREQUENCY.RARE,
    type: FAILURE_TYPE.HARDWARE,
  };

  const form = useForm({
    defaultValues: defaults,
    validators: { onSubmit: TechnicalReportSchema },
    onSubmit: async ({ value }) => {
      await submit.mutateAsync({ id: failureId, body: value });
      await navigate({ to: "/maintenance/failures" });
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow={<span>Maintenance</span>}
        title="Technical report"
        description="Document the root cause and severity of the reported failure."
        meta={
          <span className="font-mono">
            Failure #{failureId.slice(0, 8)}
          </span>
        }
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
        noValidate
        aria-label="Technical report"
        className="space-y-6 rounded-2xl border border-border/60 bg-card p-5 shadow-xs sm:p-6"
      >
        <FieldSet>
          <FieldLegend>Diagnostic</FieldLegend>
          <FieldDescription>
            Capture the explanation, occurrence date, type and frequency.
          </FieldDescription>
          <FieldGroup>
            <form.Field
              name="explanation"
              children={(field) => {
                const err = firstFieldError(field.state.meta.errors);
                const invalid = field.state.meta.isTouched && Boolean(err);
                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Explanation <span aria-hidden="true" className="text-destructive">*</span>
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      rows={5}
                      placeholder="Root cause, observed behaviour, parts impacted…"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={invalid}
                    />
                    {invalid ? (
                      <FieldDescription className="text-destructive">{err}</FieldDescription>
                    ) : null}
                  </Field>
                );
              }}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <form.Field
                name="appearedAt"
                children={(field) => {
                  const err = firstFieldError(field.state.meta.errors);
                  const invalid = field.state.meta.isTouched && Boolean(err);
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Appeared at <span aria-hidden="true" className="text-destructive">*</span>
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
                name="frequency"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Frequency</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(v) =>
                        field.handleChange((v ?? FAILURE_FREQUENCY.RARE) as FailureFrequency)
                      }
                    >
                      <SelectTrigger id={field.name} className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FAILURE_FREQUENCY).map((f) => (
                          <SelectItem key={f} value={f}>
                            {HUMAN_FREQUENCY[f] ?? f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <form.Field
                name="type"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(v) =>
                        field.handleChange((v ?? FAILURE_TYPE.HARDWARE) as FailureType)
                      }
                    >
                      <SelectTrigger id={field.name} className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FAILURE_TYPE).map((t) => (
                          <SelectItem key={t} value={t}>
                            {HUMAN_TYPE[t] ?? t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>
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
                    <span>Save report</span>
                  </>
                )}
              </Button>
            )}
          />
        </div>
      </form>
    </div>
  );
}
