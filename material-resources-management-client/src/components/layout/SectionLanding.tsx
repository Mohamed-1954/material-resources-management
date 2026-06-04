import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { getSection } from "@/lib/nav-sections";
import { cn } from "@/lib/utils";

interface SectionLandingProps {
  sectionId: string;
}

export function SectionLanding({ sectionId }: SectionLandingProps) {
  const section = getSection(sectionId);
  if (!section) {
    return (
      <PageHeader title="Unknown section" description="No section matched this URL." />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title={section.label} description={section.description} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group/section-card relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5",
                "transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out",
                "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-primary/5 opacity-0 transition-opacity duration-300 group-hover/section-card:opacity-100"
              />
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon className="size-4" />
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 text-muted-foreground transition-[transform,color] duration-200 group-hover/section-card:-translate-y-0.5 group-hover/section-card:translate-x-0.5 group-hover/section-card:text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <div className="font-heading text-base font-semibold tracking-tight">
                  {item.label}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
