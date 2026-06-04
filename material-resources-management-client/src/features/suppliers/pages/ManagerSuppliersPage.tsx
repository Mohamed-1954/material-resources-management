import { useState } from "react";

import { SUPPLIER_STATUS, type SupplierDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/errors";

import {
  useBlacklistSupplierMutation,
  useRemoveFromBlacklistMutation,
} from "../mutations";
import { useSuppliersQuery } from "../queries";

export function ManagerSuppliersPage() {
  const suppliers = useSuppliersQuery();
  const blacklist = useBlacklistSupplierMutation();
  const unblacklist = useRemoveFromBlacklistMutation();
  const [reasonById, setReasonById] = useState<Record<string, string>>({});

  const columns: Column<SupplierDto>[] = [
    { key: "name", header: "Company", render: (r) => r.companyName },
    { key: "location", header: "Location", render: (r) => r.location ?? "—" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) =>
        r.status === SUPPLIER_STATUS.ACTIVE ? (
          <div className="flex gap-2 items-center">
            <Input
              aria-label={`Reason to blacklist ${r.companyName}`}
              placeholder="reason"
              value={reasonById[r.id] ?? ""}
              onChange={(e) =>
                setReasonById((s) => ({ ...s, [r.id]: e.target.value }))
              }
              className="h-7 w-32 text-xs"
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                blacklist.mutate({
                  id: r.id,
                  reason: reasonById[r.id] ?? "Repeated violations",
                })
              }
              disabled={blacklist.isPending}
            >
              Blacklist
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => unblacklist.mutate(r.id)}
            disabled={unblacklist.isPending}
          >
            Remove from blacklist
          </Button>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="View, blacklist, and rehabilitate registered suppliers."
      />
      {suppliers.isError ? (
        <ErrorCard
          title="Could not load suppliers"
          message={getErrorMessage(suppliers.error)}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={suppliers.data ?? []}
          isLoading={suppliers.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No suppliers registered yet"
        />
      )}
    </div>
  );
}
