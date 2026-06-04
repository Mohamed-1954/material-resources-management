import type { ResourceDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/errors";

import { useResourcesQuery } from "../queries";

export function ManagerResourcesPage() {
  const resources = useResourcesQuery();

  const columns: Column<ResourceDto>[] = [
    { key: "code", header: "Inventory", render: (r) => r.inventoryCode },
    { key: "type", header: "Type", render: (r) => r.resourceType },
    { key: "brand", header: "Brand", render: (r) => r.brand ?? "—" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "warranty",
      header: "Warranty until",
      render: (r) => r.warrantyEndDate ?? "—",
    },
  ];

  return (
    <div>
      <PageHeader title="Resources" description="All faculty hardware resources." />
      {resources.isError ? (
        <ErrorCard
          title="Could not load resources"
          message={getErrorMessage(resources.error)}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={resources.data ?? []}
          isLoading={resources.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No resources registered yet"
        />
      )}
    </div>
  );
}
