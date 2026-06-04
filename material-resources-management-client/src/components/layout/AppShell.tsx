import { useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/theme-toggle";

import { Breadcrumbs } from "./Breadcrumbs";
import { BrandMark } from "./BrandMark";
import { NotificationsBell } from "./NotificationsBell";
import { Sidebar, SidebarBody } from "./Sidebar";
import { UserMenu } from "./UserMenu";

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex min-h-[100dvh] bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          data-slot="app-header"
          className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-md sm:px-6"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Open navigation"
                    className="md:hidden"
                  />
                }
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent
                side="left"
                showCloseButton={false}
                className="w-72 border-r border-sidebar-border bg-sidebar p-0"
              >
                <SidebarBody onNavigate={() => setMobileOpen(false)} className="flex w-full" />
              </SheetContent>
            </Sheet>
            <div className="md:hidden">
              <BrandMark size="sm" withWordmark={false} />
            </div>
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-1.5">
            <NotificationsBell />
            <ThemeToggle />
            <span className="mx-1 hidden h-6 w-px bg-border/60 sm:block" aria-hidden="true" />
            <UserMenu />
          </div>
        </header>
        <main
          id="main"
          className="relative isolate flex-1 overflow-x-hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-grid mask-radial-fade opacity-[0.4] dark:opacity-[0.25]"
          />
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
