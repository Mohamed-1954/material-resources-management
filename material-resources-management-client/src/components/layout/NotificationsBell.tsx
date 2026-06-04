import { useState } from "react";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useMarkAllNotificationsReadMutation,
  useUnreadNotificationsQuery,
} from "@/features/notifications/queries";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const unread = useUnreadNotificationsQuery();
  const markAll = useMarkAllNotificationsReadMutation();

  const items = unread.data ?? [];
  const count = items.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
            className="relative"
          />
        }
      >
        <Bell />
        {count > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center"
          >
            {count}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-3 py-2 flex items-center justify-between border-b">
          <span className="text-xs font-medium">Notifications</span>
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={count === 0 || markAll.isPending}
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            Mark all read
          </button>
        </div>
        <ul className="max-h-80 overflow-y-auto divide-y">
          {items.length === 0 ? (
            <li className="px-3 py-6 text-xs text-muted-foreground text-center">
              No unread notifications
            </li>
          ) : (
            items.map((n) => (
              <li key={n.id} className="px-3 py-2 text-xs">
                <div className="font-medium">{n.event.replace(/_/g, " ")}</div>
                <div className="text-muted-foreground">{n.message}</div>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
