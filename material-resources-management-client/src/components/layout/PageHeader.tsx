import * as React from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.ComponentProps<"header"> {
  eyebrow?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  meta?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumbs,
  meta,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "mb-6 flex flex-col gap-5 border-b border-border/60 pb-6 md:mb-8 md:flex-row md:items-end md:justify-between md:pb-8",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 space-y-2">
        {breadcrumbs ? <div className="-mt-1">{breadcrumbs}</div> : null}
        {eyebrow ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="font-heading text-[clamp(1.5rem,1.05rem+1.5vw,2rem)] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
        {meta ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs text-muted-foreground">
            {meta}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
