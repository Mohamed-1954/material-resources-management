import { useState } from "react";

import { OFFER_STATUS, type SupplierOfferDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/errors";

import {
  useAcceptOfferMutation,
  useEliminateOfferMutation,
  useRejectOfferMutation,
} from "../mutations";
import { useOffersByTenderQuery } from "../queries";
import { useTenderQuery } from "../../tenders/queries";

export function TenderEvaluationPage({ tenderId }: { tenderId: string }) {
  const tender = useTenderQuery(tenderId);
  const offers = useOffersByTenderQuery(tenderId);
  const eliminate = useEliminateOfferMutation(tenderId);
  const reject = useRejectOfferMutation(tenderId);
  const accept = useAcceptOfferMutation(tenderId);
  const [reasonById, setReasonById] = useState<Record<string, string>>({});

  const sortedOffers = (offers.data ?? [])
    .slice()
    .sort(
      (a, b) =>
        Number.parseFloat(String(a.totalPrice)) - Number.parseFloat(String(b.totalPrice)),
    );

  const columns: Column<SupplierOfferDto>[] = [
    { key: "id", header: "Offer", render: (r) => r.id.slice(0, 8) },
    { key: "supplier", header: "Supplier", render: (r) => r.supplierId.slice(0, 8) },
    {
      key: "total",
      header: "Total",
      render: (r) => Number.parseFloat(String(r.totalPrice)).toFixed(2),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => {
        const evaluable =
          r.status === OFFER_STATUS.SUBMITTED || r.status === OFFER_STATUS.UNDER_REVIEW;
        if (!evaluable) return null;
        return (
          <div className="flex gap-2 items-center">
            <Input
              aria-label="Reason"
              placeholder="reason"
              value={reasonById[r.id] ?? ""}
              onChange={(e) =>
                setReasonById((s) => ({ ...s, [r.id]: e.target.value }))
              }
              className="h-7 w-32 text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                eliminate.mutate({
                  id: r.id,
                  reason: reasonById[r.id] ?? "Invalid",
                })
              }
              disabled={eliminate.isPending}
            >
              Eliminate
            </Button>
            <Button
              size="sm"
              onClick={() => accept.mutate(r.id)}
              disabled={accept.isPending}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                reject.mutate({
                  id: r.id,
                  reason: reasonById[r.id] ?? "Not selected",
                })
              }
              disabled={reject.isPending}
            >
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Evaluation — ${tender.data?.reference ?? tenderId}`}
        description="Lowest valid offer is suggested first. Accepting an offer will reject all siblings and award the tender."
      />
      {offers.isError ? (
        <ErrorCard
          title="Could not load offers"
          message={getErrorMessage(offers.error)}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={sortedOffers}
          isLoading={offers.isLoading}
          rowKey={(o) => o.id}
          emptyMessage="No offers for this tender yet"
        />
      )}
    </div>
  );
}
