import * as React from "react";
import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

interface ErrorCardProps {
  title?: React.ReactNode;
  message?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorCard({
  title = "Something went wrong",
  message,
  action,
  className,
}: ErrorCardProps) {
  return (
    <div
      data-slot="error-card"
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive",
        className,
      )}
    >
      <TriangleAlert className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {message ? <p className="text-xs text-destructive/80">{message}</p> : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  );
}
