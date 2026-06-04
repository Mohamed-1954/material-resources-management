import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ChartCard({
  title,
  description,
  actions,
  className,
  children,
}: ChartCardProps) {
  return (
    <section
      data-slot="chart-card"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-xs",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      <div className="min-h-[14rem]">{children}</div>
    </section>
  );
}
