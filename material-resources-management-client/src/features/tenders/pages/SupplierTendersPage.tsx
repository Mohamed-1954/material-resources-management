import { Link } from "@tanstack/react-router";

import type { TenderDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

import { useActiveTendersQuery } from "../queries";

export function SupplierTendersPage() {
  const tenders = useActiveTendersQuery();

  const cols: Column<TenderDto>[] = [
    { key: "ref", header: "Reference", render: (r) => r.reference },
    { key: "title", header: "Title", render: (r) => r.title },
    {
      key: "dates",
      header: "Window",
      render: (r) => `${r.startDate} → ${r.endDate}`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <Link
          to="/supplier/tenders/$tenderId/submit-offer"
          params={{ tenderId: r.id }}
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          Submit offer
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Active tenders"
        description="Submit your offer before the closing date."
      />
      {tenders.isError ? (
        <ErrorCard
          title="Could not load tenders"
          message={getErrorMessage(tenders.error)}
        />
      ) : (
        <DataTable
          columns={cols}
          rows={tenders.data ?? []}
          isLoading={tenders.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No active tenders right now"
        />
      )}
    </div>
  );
}
