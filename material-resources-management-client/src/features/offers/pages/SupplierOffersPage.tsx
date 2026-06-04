import type { SupplierOfferDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/errors";

import { useOffersQuery } from "../queries";

export function SupplierOffersPage() {
  const offers = useOffersQuery();

  const cols: Column<SupplierOfferDto>[] = [
    { key: "id", header: "Offer", render: (r) => r.id.slice(0, 8) },
    { key: "tender", header: "Tender", render: (r) => r.tenderId.slice(0, 8) },
    {
      key: "total",
      header: "Total",
      render: (r) => Number.parseFloat(String(r.totalPrice)).toFixed(2),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="My offers" description="Track the status of every offer you've submitted." />
      {offers.isError ? (
        <ErrorCard
          title="Could not load offers"
          message={getErrorMessage(offers.error)}
        />
      ) : (
        <DataTable
          columns={cols}
          rows={offers.data ?? []}
          isLoading={offers.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No offers yet"
        />
      )}
    </div>
  );
}
