import { Link, useRouterState } from "@tanstack/react-router";

import { useAuth } from "@/lib/auth-context";
import { NAV_SECTIONS } from "@/lib/nav-sections";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";

interface SidebarBodyProps {
  onNavigate?: () => void;
  className?: string;
}

export function SidebarBody({ onNavigate, className }: SidebarBodyProps) {
  const auth = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = auth.user?.role;
  const sections = role
    ? NAV_SECTIONS.filter((s) => s.roles.includes(role))
        .map((s) => ({ ...s, items: s.items.filter((i) => i.roles.includes(role)) }))
        .filter((s) => s.items.length > 0)
    : [];

  return (
    <aside
      data-slot="sidebar"
      aria-label="Primary"
      className={cn(
        "flex flex-col gap-1 border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex h-16 items-center px-5">
        <BrandMark size="md" />
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {sections.map((section) => (
          <div key={section.id} className="space-y-1">
            <div className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {section.label}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.to || pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      activeOptions={{ exact: false }}
                      aria-current={active ? "page" : undefined}
                      onClick={onNavigate}
                      className={cn(
                        "group/nav-item relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs/relaxed font-medium",
                        "transition-[background-color,color,box-shadow] duration-150",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs ring-1 ring-sidebar-primary/15"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary transition-opacity",
                          active ? "opacity-100" : "opacity-0 group-hover/nav-item:opacity-40",
                        )}
                      />
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          active ? "text-sidebar-primary" : "text-muted-foreground group-hover/nav-item:text-foreground",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border px-5 py-3 text-[10px] text-muted-foreground">
        <span className="font-mono">v0.1.0</span>
        <span aria-hidden="true" className="mx-2">·</span>
        <span>© Ynov Academic</span>
      </div>
    </aside>
  );
}

export function Sidebar() {
  return <SidebarBody className="hidden w-64 md:flex" />;
}
