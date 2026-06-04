import { useState } from "react";

import { NEED_STATUS, type NeedRequestDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

import { NeedRequestForm } from "../components/NeedRequestForm";
import { useTransitionNeedMutation } from "../mutations";
import { useNeedsQuery } from "../queries";

export function TeacherNeedsPage() {
  const [showForm, setShowForm] = useState(false);
  const needs = useNeedsQuery();
  const submit = useTransitionNeedMutation("submit");

  const cols: Column<NeedRequestDto>[] = [
    { key: "id", header: "Ref", render: (r) => r.id.slice(0, 8) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "createdAt",
      header: "Created",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) =>
        r.status === NEED_STATUS.DRAFT ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => submit.mutate(r.id)}
            disabled={submit.isPending}
          >
            Submit
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My need requests"
        description="Capture computer or printer needs and submit them to your department head."
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "New request"}
          </Button>
        }
      />
      {showForm ? <NeedRequestForm onCreated={() => setShowForm(false)} /> : null}
      {needs.isError ? (
        <ErrorCard
          title="Could not load needs"
          message={getErrorMessage(needs.error)}
        />
      ) : (
        <DataTable
          columns={cols}
          rows={needs.data ?? []}
          isLoading={needs.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No need requests yet"
        />
      )}
    </div>
  );
}
