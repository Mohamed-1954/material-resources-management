import { useForm } from "@tanstack/react-form";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import * as v from "valibot";

import { RESOURCE_TYPES, type NeedCreateInput } from "@frms/shared";

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

import { useCreateNeedMutation } from "../mutations";

interface ItemDraft {
  resourceType: "COMPUTER" | "PRINTER";
  brand: string;
  cpu: string;
  ram: string;
  disk: string;
  screen: string;
  printSpeed: string;
  resolution: string;
  quantity: number;
  justification: string;
}

interface NeedFormValues {
  notes: string;
  items: ItemDraft[];
}

const emptyItem: ItemDraft = {
  resourceType: "COMPUTER",
  brand: "",
  cpu: "",
  ram: "",
  disk: "",
  screen: "",
  printSpeed: "",
  resolution: "",
  quantity: 1,
  justification: "",
};

const quantitySchema = v.pipe(v.number(), v.integer(), v.minValue(1, "At least 1"));

function toApiItems(items: ItemDraft[]): NeedCreateInput["items"] {
  return items.map((it) =>
    it.resourceType === RESOURCE_TYPES.COMPUTER
      ? {
          resourceType: "COMPUTER" as const,
          brand: it.brand || null,
          cpu: it.cpu || null,
          ram: it.ram || null,
          disk: it.disk || null,
          screen: it.screen || null,
          quantity: it.quantity,
          justification: it.justification || null,
        }
      : {
          resourceType: "PRINTER" as const,
          brand: it.brand || null,
          printSpeed: it.printSpeed || null,
          resolution: it.resolution || null,
          quantity: it.quantity,
          justification: it.justification || null,
        },
  );
}

export function NeedRequestForm({ onCreated }: { onCreated?: () => void }) {
  const create = useCreateNeedMutation();

  const form = useForm({
    defaultValues: { notes: "", items: [emptyItem] } satisfies NeedFormValues,
    onSubmit: async ({ value, formApi }) => {
      await create.mutateAsync({
        notes: value.notes || null,
        items: toApiItems(value.items),
      });
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
      aria-label="Create need request"
      className="space-y-6 rounded-2xl border border-border/60 bg-card p-5 shadow-xs sm:p-6"
    >
      <FieldSet>
        <FieldLegend>Request overview</FieldLegend>
        <FieldDescription>
          Provide optional context for the resource manager before adding line items.
        </FieldDescription>
        <form.Field
          name="notes"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                rows={2}
                placeholder="Why is this needed? Any timing or priority context?"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          )}
        />
      </FieldSet>

      <FieldSet>
        <FieldLegend>Line items</FieldLegend>
        <FieldDescription>
          Add one item per device. Specs are optional but help match a supplier offer.
        </FieldDescription>

        <form.Field
          name="items"
          mode="array"
          children={(itemsField) => (
            <>
              <div className="space-y-4">
                {itemsField.state.value.map((item, idx) => (
                  <section
                    key={idx}
                    className="rounded-xl border border-border/60 bg-background/40 p-4"
                  >
                    <header className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Item {idx + 1}
                      </h3>
                      {itemsField.state.value.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => itemsField.removeValue(idx)}
                          aria-label={`Remove item ${idx + 1}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      ) : null}
                    </header>

                    <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <form.Field
                        name={`items[${idx}].resourceType`}
                        children={(field) => (
                          <Field>
                            <FieldLabel htmlFor={field.name}>Type</FieldLabel>
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
                                <SelectItem value="COMPUTER">Computer</SelectItem>
                                <SelectItem value="PRINTER">Printer</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        )}
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
                        name={`items[${idx}].brand`}
                        children={(field) => (
                          <Field className="sm:col-span-2">
                            <FieldLabel htmlFor={field.name}>Brand</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              placeholder="e.g. Dell, HP, Brother"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                          </Field>
                        )}
                      />

                      {item.resourceType === "COMPUTER" ? (
                        <>
                          <form.Field
                            name={`items[${idx}].cpu`}
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>CPU</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  placeholder="e.g. Intel i7-13700"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                          <form.Field
                            name={`items[${idx}].ram`}
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>RAM</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  placeholder="e.g. 32 GB DDR5"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                          <form.Field
                            name={`items[${idx}].disk`}
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Disk</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  placeholder="e.g. 1 TB NVMe"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                          <form.Field
                            name={`items[${idx}].screen`}
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Screen</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  placeholder="e.g. 24″ 1440p"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                        </>
                      ) : (
                        <>
                          <form.Field
                            name={`items[${idx}].printSpeed`}
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Print speed</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  placeholder="e.g. 35 ppm"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                          <form.Field
                            name={`items[${idx}].resolution`}
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Resolution</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  placeholder="e.g. 1200×1200 dpi"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                        </>
                      )}

                      <form.Field
                        name={`items[${idx}].justification`}
                        children={(field) => (
                          <Field className="sm:col-span-2">
                            <FieldLabel htmlFor={field.name}>Justification</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              placeholder="Why this device, this configuration?"
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

              <div className="flex flex-col-reverse justify-between gap-2 border-t border-border/60 pt-5 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => itemsField.pushValue(emptyItem)}
                >
                  <Plus className="size-3.5" />
                  <span>Add another item</span>
                </Button>
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
                          <span>Save draft</span>
                        </>
                      )}
                    </Button>
                  )}
                />
              </div>
            </>
          )}
        />
      </FieldSet>
    </form>
  );
}
