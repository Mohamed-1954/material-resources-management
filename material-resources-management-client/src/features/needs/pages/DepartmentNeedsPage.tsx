import { NEED_STATUS, type NeedRequestDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

import { useTransitionNeedMutation } from "../mutations";
import { useNeedsQuery } from "../queries";

export function DepartmentNeedsPage() {
  const needs = useNeedsQuery();
  const approve = useTransitionNeedMutation("approve");
  const reject = useTransitionNeedMutation("reject");
  const requestChanges = useTransitionNeedMutation("request-changes");
  const sendToManager = useTransitionNeedMutation("send-to-resource-manager");

  const cols: Column<NeedRequestDto>[] = [
    { key: "id", header: "Need", render: (r) => r.id.slice(0, 8) },
    {
      key: "createdAt",
      header: "Created",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2 flex-wrap">
          {r.status === NEED_STATUS.SUBMITTED ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => approve.mutate(r.id)}
                disabled={approve.isPending}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => requestChanges.mutate(r.id)}
                disabled={requestChanges.isPending}
              >
                Request changes
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => reject.mutate(r.id)}
                disabled={reject.isPending}
              >
                Reject
              </Button>
            </>
          ) : null}
          {r.status === NEED_STATUS.APPROVED_BY_DEPARTMENT ? (
            <Button
              size="sm"
              onClick={() => sendToManager.mutate(r.id)}
              disabled={sendToManager.isPending}
            >
              Send to resource manager
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Department needs"
        description="Review submissions, request changes, finalize, and send approved requests to the resource manager."
      />
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
          emptyMessage="No needs awaiting review"
        />
      )}
    </div>
  );
}
