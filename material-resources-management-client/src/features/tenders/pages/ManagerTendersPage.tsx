import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { TENDER_STATUS, type TenderDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, buttonVariants } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

import { TenderForm } from "../components/TenderForm";
import { useTransitionTenderMutation } from "../mutations";
import { useTendersQuery } from "../queries";

export function ManagerTendersPage() {
  const tenders = useTendersQuery();
  const publish = useTransitionTenderMutation("publish");
  const close = useTransitionTenderMutation("close");
  const startEval = useTransitionTenderMutation("start-evaluation");
  const [showForm, setShowForm] = useState(false);

  const columns: Column<TenderDto>[] = [
    { key: "reference", header: "Ref", render: (r) => r.reference },
    { key: "title", header: "Title", render: (r) => r.title },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "dates",
      header: "Window",
      render: (r) => `${r.startDate} → ${r.endDate}`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          {r.status === TENDER_STATUS.DRAFT ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => publish.mutate(r.id)}
              disabled={publish.isPending}
            >
              Publish
            </Button>
          ) : null}
          {r.status === TENDER_STATUS.PUBLISHED ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => close.mutate(r.id)}
              disabled={close.isPending}
            >
              Close
            </Button>
          ) : null}
          {r.status === TENDER_STATUS.CLOSED ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => startEval.mutate(r.id)}
              disabled={startEval.isPending}
            >
              Start evaluation
            </Button>
          ) : null}
          {r.status === TENDER_STATUS.EVALUATION || r.status === TENDER_STATUS.AWARDED ? (
            <Link
              to="/manager/tenders/$tenderId/evaluation"
              params={{ tenderId: r.id }}
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Evaluate
            </Link>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenders"
        description="Create and manage calls for tenders."
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "New tender"}
          </Button>
        }
      />
      {showForm ? <TenderForm onCreated={() => setShowForm(false)} /> : null}
      {tenders.isError ? (
        <ErrorCard
          title="Could not load tenders"
          message={getErrorMessage(tenders.error)}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={tenders.data ?? []}
          isLoading={tenders.isLoading}
          rowKey={(t) => t.id}
          emptyMessage="No tenders yet"
        />
      )}
    </div>
  );
}
