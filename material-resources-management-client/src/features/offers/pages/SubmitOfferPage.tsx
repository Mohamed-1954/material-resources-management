import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Plus, Send, Trash2 } from "lucide-react";
import * as v from "valibot";

import { RESOURCE_TYPES, type OfferCreateInput } from "@frms/shared";

import { ErrorCard } from "@/components/feedback/ErrorCard";
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
import { getErrorMessage } from "@/lib/errors";
import { firstFieldError } from "@/lib/form-utils";

import { useCreateOfferMutation, useSubmitOfferMutation } from "../mutations";
import { useTenderQuery } from "../../tenders/queries";

interface ItemDraft {
  resourceType: "COMPUTER" | "PRINTER";
  brand: string;
  unitPrice: number;
  quantity: number;
  warrantyDurationMonths: number;
  futureDeliveryDate: string;
  technicalDetails: string;
}

interface OfferFormValues {
  items: ItemDraft[];
}

function defaultItem(): ItemDraft {
  return {
    resourceType: "COMPUTER",
    brand: "",
    unitPrice: 0,
    quantity: 1,
    warrantyDurationMonths: 12,
    futureDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    technicalDetails: "",
  };
}

const brandSchema = v.pipe(v.string(), v.minLength(1, "Brand is required"));
const unitPriceSchema = v.pipe(v.number(), v.minValue(0, "Must be >= 0"));
const quantitySchema = v.pipe(v.number(), v.integer(), v.minValue(1, "At least 1"));
const warrantySchema = v.pipe(v.number(), v.integer(), v.minValue(1, "At least 1 month"));

function toApiItems(items: ItemDraft[]): OfferCreateInput["items"] {
  return items.map((it) => ({
    resourceType: it.resourceType,
    brand: it.brand,
    unitPrice: it.unitPrice,
    quantity: it.quantity,
    warrantyDurationMonths: it.warrantyDurationMonths,
    futureDeliveryDate: it.futureDeliveryDate,
    technicalDetails: it.technicalDetails || null,
  }));
}

export function SubmitOfferPage({ tenderId }: { tenderId: string }) {
  const navigate = useNavigate();
  const tender = useTenderQuery(tenderId);
  const create = useCreateOfferMutation();
  const submit = useSubmitOfferMutation();

  const form = useForm({
    defaultValues: { items: [defaultItem()] } satisfies OfferFormValues,
    onSubmit: async ({ value }) => {
      const offer = await create.mutateAsync({
        tenderId,
        body: { items: toApiItems(value.items) },
      });
      await submit.mutateAsync(offer.id);
      void navigate({ to: "/supplier/offers" });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span>Supplier</span>}
        title="Submit offer"
        description="Provide brand, price, quantity, warranty duration, and a delivery date for each line."
        meta={
          <span className="font-mono">
            Tender · {tender.data?.reference ?? tenderId}
          </span>
        }
      />
      {tender.isError ? (
        <ErrorCard
          title="Could not load tender"
          message={getErrorMessage(tender.error)}
        />
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
        noValidate
        aria-label="Submit offer"
        className="space-y-6 rounded-2xl border border-border/60 bg-card p-5 shadow-xs sm:p-6"
      >
        <FieldSet>
          <FieldLegend>Offer lines</FieldLegend>
          <FieldDescription>
            One row per device. The total is summed automatically.
          </FieldDescription>

          <form.Field
            name="items"
            mode="array"
            children={(itemsField) => {
              const total = itemsField.state.value.reduce(
                (s, it) => s + it.unitPrice * it.quantity,
                0,
              );
              return (
                <>
                  <div className="space-y-4">
                    {itemsField.state.value.map((_, idx) => (
                      <section
                        key={idx}
                        className="rounded-xl border border-border/60 bg-background/40 p-4"
                      >
                        <header className="mb-3 flex items-center justify-between gap-2">
                          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Line {idx + 1}
                          </h3>
                          {itemsField.state.value.length > 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => itemsField.removeValue(idx)}
                              aria-label={`Remove line ${idx + 1}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          ) : null}
                        </header>
                        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <form.Field
                            name={`items[${idx}].resourceType`}
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Resource type</FieldLabel>
                                <Select
                                  value={field.state.value}
                                  onValueChange={(value) =>
                                    field.handleChange(
                                      (value ?? "COMPUTER") as ItemDraft["resourceType"],
                                    )
                                  }
                                >
                                  <SelectTrigger id={field.name} className="h-10 w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={RESOURCE_TYPES.COMPUTER}>
                                      Computer
                                    </SelectItem>
                                    <SelectItem value={RESOURCE_TYPES.PRINTER}>
                                      Printer
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </Field>
                            )}
                          />

                          <form.Field
                            name={`items[${idx}].brand`}
                            validators={{ onChange: brandSchema }}
                            children={(field) => {
                              const err = firstFieldError(field.state.meta.errors);
                              const invalid = field.state.meta.isTouched && Boolean(err);
                              return (
                                <Field data-invalid={invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Brand{" "}
                                    <span aria-hidden="true" className="text-destructive">
                                      *
                                    </span>
                                  </FieldLabel>
                                  <Input
                                    id={field.name}
                                    name={field.name}
                                    placeholder="e.g. Dell"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    aria-invalid={invalid}
                                  />
                                  {invalid ? (
                                    <FieldDescription className="text-destructive">
                                      {err}
                                    </FieldDescription>
                                  ) : null}
                                </Field>
                              );
                            }}
                          />

                          <form.Field
                            name={`items[${idx}].unitPrice`}
                            validators={{ onChange: unitPriceSchema }}
                            children={(field) => {
                              const err = firstFieldError(field.state.meta.errors);
                              const invalid = field.state.meta.isTouched && Boolean(err);
                              return (
                                <Field data-invalid={invalid}>
                                  <FieldLabel htmlFor={field.name}>Unit price</FieldLabel>
                                  <Input
                                    id={field.name}
                                    name={field.name}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(Number(e.target.value) || 0)
                                    }
                                    aria-invalid={invalid}
                                  />
                                  {invalid ? (
                                    <FieldDescription className="text-destructive">
                                      {err}
                                    </FieldDescription>
                                  ) : null}
                                </Field>
                              );
                            }}
                          />

                          <form.Field
                            name={`items[${idx}].quantity`}
                            validators={{ onChange: quantitySchema }}
                            children={(field) => {
                              const err = firstFieldError(field.state.meta.errors);
                              const invalid = field.state.meta.isTouched && Boolean(err);
                              return (
                                <Field data-invalid={invalid}>
                                  <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                                  <Input
                                    id={field.name}
                                    name={field.name}
                                    type="number"
                                    min={1}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(Math.max(1, Number(e.target.value) || 1))
                                    }
                                    aria-invalid={invalid}
                                  />
                                  {invalid ? (
                                    <FieldDescription className="text-destructive">
                                      {err}
                                    </FieldDescription>
                                  ) : null}
                                </Field>
                              );
                            }}
                          />

                          <form.Field
                            name={`items[${idx}].warrantyDurationMonths`}
                            validators={{ onChange: warrantySchema }}
                            children={(field) => {
                              const err = firstFieldError(field.state.meta.errors);
                              const invalid = field.state.meta.isTouched && Boolean(err);
                              return (
                                <Field data-invalid={invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Warranty (months)
                                  </FieldLabel>
                                  <Input
                                    id={field.name}
                                    name={field.name}
                                    type="number"
                                    min={1}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(
                                        Math.max(1, Number(e.target.value) || 12),
                                      )
                                    }
                                    aria-invalid={invalid}
                                  />
                                  {invalid ? (
                                    <FieldDescription className="text-destructive">
                                      {err}
                                    </FieldDescription>
                                  ) : null}
                                </Field>
                              );
                            }}
                          />

                          <form.Field
                            name={`items[${idx}].futureDeliveryDate`}
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Future delivery</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  type="date"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />

                          <form.Field
                            name={`items[${idx}].technicalDetails`}
                            children={(field) => (
                              <Field className="lg:col-span-3 sm:col-span-2">
                                <FieldLabel htmlFor={field.name}>Technical details</FieldLabel>
                                <Textarea
                                  id={field.name}
                                  name={field.name}
                                  rows={2}
                                  placeholder="Optional — anything that helps the evaluator."
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                        </FieldGroup>
                      </section>
                    ))}
                  </div>

                  <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => itemsField.pushValue(defaultItem())}
                    >
                      <Plus className="size-3.5" />
                      <span>Add another line</span>
                    </Button>
                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                      <div className="inline-flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs sm:justify-start">
                        <span className="text-muted-foreground">Total</span>
                        <strong className="font-heading tabular-nums">
                          {total.toFixed(2)}
                        </strong>
                      </div>
                      <form.Subscribe
                        selector={(state) =>
                          [state.isSubmitting, state.canSubmit] as const
                        }
                        children={([isSubmitting, canSubmit]) => (
                          <Button
                            type="submit"
                            disabled={isSubmitting || !canSubmit}
                            className="glow"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>Submitting…</span>
                              </>
                            ) : (
                              <>
                                <Send className="size-3.5" />
                                <span>Submit offer</span>
                              </>
                            )}
                          </Button>
                        )}
                      />
                    </div>
                  </div>
                </>
              );
            }}
          />
        </FieldSet>
      </form>
    </div>
  );
}
