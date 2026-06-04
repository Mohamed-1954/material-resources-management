import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Globe, Loader2, MapPin, ShieldCheck, User2, Users } from "lucide-react";
import { toast } from "sonner";

import { SupplierRegisterSchema, type SupplierRegisterInput } from "@frms/shared";

import { BrandMark } from "@/components/layout/BrandMark";
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
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getErrorMessage } from "@/lib/errors";
import { firstFieldError } from "@/lib/form-utils";

import { suppliersApi } from "../../suppliers/api";

const defaults: SupplierRegisterInput = {
  email: "",
  password: "",
  name: "",
  companyName: "",
  managerName: "",
  location: "",
  address: "",
  website: "",
};

export function RegisterSupplierPage() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: defaults,
    validators: { onSubmit: SupplierRegisterSchema },
    onSubmit: async ({ value }) => {
      try {
        await suppliersApi.register(value);
        toast.success("Supplier account created. You can sign in now.");
        await navigate({ to: "/login", replace: true });
      } catch (error) {
        toast.error(getErrorMessage(error, "Registration failed"));
      }
    },
  });

  return (
    <div className="relative min-h-[100dvh] bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-grid mask-radial-fade opacity-50 dark:opacity-30"
      />
      <div className="flex items-center justify-between gap-3 px-6 py-5 sm:px-10">
        <Link to="/login" aria-label="Back to sign in" className="inline-flex">
          <BrandMark size="md" />
        </Link>
        <ThemeToggle />
      </div>

      <main className="mx-auto w-full max-w-3xl px-6 pb-16 sm:px-10">
        <header className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
            <ShieldCheck className="size-3 text-primary" />
            <span>Supplier registration</span>
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Set up your supplier account
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Create a supplier identity to view active tenders, submit offers and respond to
            warranty workflows. Fields marked with an asterisk are required.
          </p>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
          noValidate
          aria-label="Supplier registration"
          className="space-y-7 rounded-2xl border border-border/60 bg-card p-6 shadow-xs sm:p-8"
        >
          <FieldSet>
            <FieldLegend>Account credentials</FieldLegend>
            <FieldDescription>
              These are the credentials your contact will use to sign in.
            </FieldDescription>
            <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field
                name="email"
                children={(field) => (
                  <FieldRow
                    field={field}
                    label="Contact email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="company@example.com"
                  />
                )}
              />
              <form.Field
                name="password"
                children={(field) => (
                  <FieldRow
                    field={field}
                    label="Password"
                    required
                    type="password"
                    autoComplete="new-password"
                    helper="Minimum 8 characters"
                  />
                )}
              />
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Company</FieldLegend>
            <FieldDescription>
              The information shown on your tenders and offers.
            </FieldDescription>
            <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field
                name="name"
                children={(field) => (
                  <FieldRow
                    field={field}
                    label="Contact name"
                    required
                    icon={User2}
                  />
                )}
              />
              <form.Field
                name="companyName"
                children={(field) => (
                  <FieldRow
                    field={field}
                    label="Company name"
                    required
                    icon={Building2}
                  />
                )}
              />
              <form.Field
                name="managerName"
                children={(field) => (
                  <FieldRow
                    field={field}
                    label="Manager name"
                    icon={Users}
                  />
                )}
              />
              <form.Field
                name="location"
                children={(field) => (
                  <FieldRow
                    field={field}
                    label="City"
                    icon={MapPin}
                  />
                )}
              />
              <form.Field
                name="address"
                children={(field) => (
                  <FieldRow
                    field={field}
                    label="Address"
                    className="sm:col-span-2"
                  />
                )}
              />
              <form.Field
                name="website"
                children={(field) => (
                  <FieldRow
                    field={field}
                    label="Website"
                    placeholder="https://"
                    icon={Globe}
                    className="sm:col-span-2"
                  />
                )}
              />
            </FieldGroup>
          </FieldSet>

          <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-border/60 pt-5 sm:flex-row sm:items-center">
            <Link
              to="/login"
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </Link>
            <form.Subscribe
              selector={(state) => [state.isSubmitting, state.canSubmit] as const}
              children={([isSubmitting, canSubmit]) => (
                <Button type="submit" disabled={isSubmitting || !canSubmit} className="glow">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Creating account…</span>
                    </>
                  ) : (
                    <span>Create supplier account</span>
                  )}
                </Button>
              )}
            />
          </div>
        </form>
      </main>
    </div>
  );
}

interface FieldRowProps {
  // TanStack Form's FieldApi instance — accept the structural shape we read.
  field: {
    name: string;
    state: {
      value: string | null | undefined;
      meta: { errors: readonly unknown[]; isTouched: boolean };
    };
    handleBlur: () => void;
    handleChange: (v: string) => void;
  };
  label: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  helper?: string;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function FieldRow({
  field,
  label,
  required,
  type = "text",
  autoComplete,
  placeholder,
  helper,
  className,
  icon: Icon,
}: FieldRowProps) {
  const err = firstFieldError(field.state.meta.errors);
  const invalid = field.state.meta.isTouched && Boolean(err);
  return (
    <Field data-invalid={invalid} className={className}>
      <FieldLabel htmlFor={field.name}>
        {label}
        {required ? <span aria-hidden="true" className="ml-0.5 text-destructive">*</span> : null}
      </FieldLabel>
      <div className="relative">
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        ) : null}
        <Input
          id={field.name}
          name={field.name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={invalid}
          className={Icon ? "pl-8" : undefined}
        />
      </div>
      {invalid ? (
        <FieldDescription className="text-destructive">{err}</FieldDescription>
      ) : helper ? (
        <FieldDescription>{helper}</FieldDescription>
      ) : null}
    </Field>
  );
}
