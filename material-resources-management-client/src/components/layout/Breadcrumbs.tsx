import { Fragment, useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Administration",
  manager: "Resource manager",
  department: "Department",
  teacher: "Teacher",
  supplier: "Supplier",
  maintenance: "Maintenance",
  dashboard: "Dashboard",
  users: "Users",
  departments: "Departments",
  "audit-logs": "Audit logs",
  needs: "Needs",
  tenders: "Tenders",
  resources: "Resources",
  suppliers: "Suppliers",
  "maintenance-decisions": "Warranty decisions",
  failures: "Failures",
  reports: "Technical reports",
  offers: "Offers",
  profile: "Profile",
  evaluation: "Evaluation",
  "submit-offer": "Submit offer",
  "technical-report": "Technical report",
};

function humanize(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  if (segment.startsWith("$")) return segment.slice(1);
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Crumb {
  href: string;
  label: string;
  isLast: boolean;
}

export function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumbs = useMemo<Crumb[]>(() => {
    const segs = pathname.split("/").filter((s) => s.length > 0 && !s.startsWith("_"));
    let acc = "";
    return segs.map((seg, i) => {
      acc += `/${seg}`;
      return { href: acc, label: humanize(seg), isLast: i === segs.length - 1 };
    });
  }, [pathname]);
  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex"
    >
      <Link
        to="/dashboard"
        aria-label="Home"
        className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Home className="size-3.5" aria-hidden="true" />
      </Link>
      <ol className="flex min-w-0 items-center gap-1">
        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            <ChevronRight className="size-3 shrink-0 text-muted-foreground/60" aria-hidden="true" />
            <li className="min-w-0">
              {crumb.isLast ? (
                <span
                  aria-current="page"
                  className={cn(
                    "inline-flex items-center rounded-md bg-muted/60 px-2 py-1 font-medium text-foreground",
                    "ring-1 ring-border/60 backdrop-blur",
                  )}
                >
                  <span className="truncate max-w-[28ch]">{crumb.label}</span>
                </span>
              ) : (
                <Link
                  to={crumb.href}
                  className="rounded-md px-1.5 py-1 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="truncate max-w-[22ch]">{crumb.label}</span>
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
