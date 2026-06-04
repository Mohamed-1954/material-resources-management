import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { roleLabel } from "@/lib/role-labels";
import { cn } from "@/lib/utils";

function initialsFor(name: string | null, email: string): string {
  const source = (name ?? email).trim();
  if (!source) return "?";
  const parts = source.split(/[\s.@_-]+/u).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function UserMenu() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth.user) return null;

  async function handleSignOut() {
    try {
      await auth.signOut();
      toast.success("Signed out");
      await navigate({ to: "/login", replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-out failed";
      toast.error(message);
    }
  }

  const friendly = roleLabel(auth.user.role);
  const initials = initialsFor(auth.user.name, auth.user.email);
  const displayName = auth.user.name ?? auth.user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Account menu for ${auth.user.email}`}
            className={cn(
              "group inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 py-1 pr-2.5 pl-1",
              "text-left text-xs/relaxed text-foreground shadow-xs backdrop-blur",
              "transition-[background-color,border-color,box-shadow] duration-150",
              "hover:bg-card hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "aria-expanded:bg-card aria-expanded:shadow-sm",
            )}
          />
        }
      >
        <Avatar className="size-7 ring-2 ring-primary/15">
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-[10px] font-semibold text-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate font-medium">{displayName}</span>
          <span className="truncate text-[10px] text-muted-foreground">{friendly}</span>
        </span>
        <ChevronDown
          className="size-3.5 text-muted-foreground transition-transform group-aria-expanded:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="space-y-0.5">
            <div className="text-xs font-semibold text-foreground">{displayName}</div>
            <div className="truncate text-[10px] text-muted-foreground">{auth.user.email}</div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <ShieldCheck className="size-3.5 text-primary" />
            <span>{friendly}</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <UserCircle2 className="size-3.5" />
            <span className="truncate">{auth.user.email}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <LogOut className="size-3.5" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
