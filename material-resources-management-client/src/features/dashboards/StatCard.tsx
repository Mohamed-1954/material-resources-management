import type { ComponentType, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  tone?: "default" | "primary" | "success" | "warning" | "info" | "destructive";
  delta?: {
    direction: "up" | "down" | "flat";
    label: string;
  };
}

const TONE_RING: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "ring-border/60",
  primary: "ring-primary/30",
  success: "ring-[color-mix(in_oklch,var(--success)_40%,transparent)]",
  warning: "ring-[color-mix(in_oklch,var(--warning)_40%,transparent)]",
  info: "ring-[color-mix(in_oklch,var(--info)_40%,transparent)]",
  destructive: "ring-destructive/30",
};

const TONE_ICON: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-[color-mix(in_oklch,var(--success)_15%,transparent)] text-[var(--success)]",
  warning: "bg-[color-mix(in_oklch,var(--warning)_18%,transparent)] text-[var(--warning)]",
  info: "bg-[color-mix(in_oklch,var(--info)_15%,transparent)] text-[var(--info)]",
  destructive: "bg-destructive/10 text-destructive",
};

const DELTA_STYLE: Record<NonNullable<StatCardProps["delta"]>["direction"], string> = {
  up: "text-[var(--success)] bg-[color-mix(in_oklch,var(--success)_12%,transparent)]",
  down: "text-destructive bg-destructive/10",
  flat: "text-muted-foreground bg-muted",
};

const DELTA_ICON = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  delta,
}: StatCardProps) {
  const DeltaIcon = delta ? DELTA_ICON[delta.direction] : null;
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card p-4 ring-1 transition-[transform,box-shadow] duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-16px_color-mix(in_oklch,var(--foreground)_25%,transparent)]",
        TONE_RING[tone],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </div>
          <div className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </div>
          {hint ? (
            <div className="text-xs text-muted-foreground">{hint}</div>
          ) : null}
        </div>
        {Icon ? (
          <span
            aria-hidden="true"
            className={cn("grid size-9 place-items-center rounded-lg", TONE_ICON[tone])}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      {delta && DeltaIcon ? (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ring-border/40">
          <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5", DELTA_STYLE[delta.direction])}>
            <DeltaIcon className="size-3" />
          </span>
          <span className="text-muted-foreground">{delta.label}</span>
        </div>
      ) : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-gradient-to-br from-primary/15 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
    </div>
  );
}
