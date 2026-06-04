import { useForm } from "@tanstack/react-form";
import { Loader2, Save } from "lucide-react";

import { ErrorCard } from "@/components/feedback/ErrorCard";
import { LoadingSkeleton } from "@/components/feedback/LoadingSkeleton";
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
import { getErrorMessage } from "@/lib/errors";

import { useUpdateSupplierMutation } from "../mutations";
import { useMyCompanyQuery } from "../queries";

interface SupplierDto {
  id: string;
  companyName: string;
  location: string | null;
  address: string | null;
  website: string | null;
  managerName: string | null;
}

export function SupplierProfilePage() {
  const me = useMyCompanyQuery();

  if (me.isLoading) {
    return (
      <div>
        <PageHeader title="Company profile" />
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (me.isError || !me.data) {
    return (
      <div>
        <PageHeader title="Company profile" />
        <ErrorCard
          title="Could not load company profile"
          message={getErrorMessage(me.error)}
        />
      </div>
    );
  }

  // Form mounts with the resolved data — no useEffect-copy-state required.
  // The `key` makes React fully remount the form if the underlying company id
  // ever switches (e.g. impersonation flow), so defaults stay in sync.
  return <ProfileForm key={me.data.id} supplier={me.data} />;
}

interface ProfileFormProps {
  supplier: SupplierDto;
}

interface FormValues {
  companyName: string;
  location: string;
  address: string;
  website: string;
  managerName: string;
}

function ProfileForm({ supplier }: ProfileFormProps) {
  const update = useUpdateSupplierMutation();

  const form = useForm({
    defaultValues: {
      companyName: supplier.companyName,
      location: supplier.location ?? "",
      address: supplier.address ?? "",
      website: supplier.website ?? "",
      managerName: supplier.managerName ?? "",
    } satisfies FormValues,
    onSubmit: async ({ value }) => {
      await update.mutateAsync({
        id: supplier.id,
        body: {
          companyName: value.companyName,
          location: value.location || null,
          address: value.address || null,
          website: value.website || null,
          managerName: value.managerName || null,
        },
      });
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Company profile"
        description="Keep your company details up to date."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
        noValidate
        aria-label="Company profile"
        className="space-y-6 rounded-2xl border border-border/60 bg-card p-5 shadow-xs sm:p-6"
      >
        <FieldSet>
          <FieldLegend>Company</FieldLegend>
          <FieldDescription>
            Visible to evaluators when they review your offers.
          </FieldDescription>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field
              name="companyName"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Company name{" "}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
            <form.Field
              name="managerName"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Manager name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
            <form.Field
              name="location"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Location</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="City, country"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
            <form.Field
              name="website"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Website</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="url"
                    placeholder="https://"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
            <form.Field
              name="address"
              children={(field) => (
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
        <div className="flex justify-end border-t border-border/60 pt-5">
          <form.Subscribe
            selector={(state) => [state.isSubmitting, state.canSubmit] as const}
            children={([isSubmitting, canSubmit]) => (
              <Button
                type="submit"
                disabled={isSubmitting || !canSubmit}
                className="glow"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    <span>Save</span>
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
