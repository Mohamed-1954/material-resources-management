import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  className?: string;
}

export function BrandMark({
  size = "md",
  withWordmark = true,
  className,
}: BrandMarkProps) {
  const dim = size === "sm" ? "size-7" : size === "lg" ? "size-10" : "size-8";
  const titleSize =
    size === "sm" ? "text-[13px]" : size === "lg" ? "text-base" : "text-sm";
  const subSize =
    size === "sm" ? "text-[9px]" : size === "lg" ? "text-[11px]" : "text-[10px]";

  return (
    <div
      data-slot="brand-mark"
      className={cn("flex items-center gap-2.5", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative grid place-items-center rounded-[10px]",
          "bg-gradient-to-br from-primary via-primary/85 to-primary/60",
          "shadow-[0_6px_18px_-8px_var(--primary)] ring-1 ring-primary/30",
          dim,
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-1/2 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7l8-4 8 4-8 4-8-4z" />
          <path d="M4 12l8 4 8-4" />
          <path d="M4 17l8 4 8-4" />
        </svg>
      </span>
      {withWordmark ? (
        <span className="flex flex-col leading-tight">
          <span className={cn("font-heading font-semibold tracking-tight", titleSize)}>
            Faculty Resources
          </span>
          <span className={cn("text-muted-foreground", subSize)}>
            Material Management
          </span>
        </span>
      ) : null}
    </div>
  );
}
