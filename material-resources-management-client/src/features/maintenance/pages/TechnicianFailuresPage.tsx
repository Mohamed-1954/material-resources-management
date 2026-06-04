import { Link } from "@tanstack/react-router";

import { FAILURE_STATUS, type FailureReportDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, buttonVariants } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

import { useFailureTransitionMutation } from "../mutations";
import { useFailuresQuery } from "../queries";

export function TechnicianFailuresPage() {
  const failures = useFailuresQuery();
  const assign = useFailureTransitionMutation("assign-technician");
  const start = useFailureTransitionMutation("start-intervention");
  const resolve = useFailureTransitionMutation("resolve");
  const severe = useFailureTransitionMutation("mark-severe");

  const cols: Column<FailureReportDto>[] = [
    { key: "id", header: "Id", render: (r) => r.id.slice(0, 8) },
    { key: "resource", header: "Resource", render: (r) => r.resourceId.slice(0, 8) },
    { key: "type", header: "Type", render: (r) => r.type ?? "—" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2 flex-wrap">
          {r.status === FAILURE_STATUS.REPORTED ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => assign.mutate(r.id)}
              disabled={assign.isPending}
            >
              Take case
            </Button>
          ) : null}
          {r.status === FAILURE_STATUS.ASSIGNED ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => start.mutate(r.id)}
              disabled={start.isPending}
            >
              Start intervention
            </Button>
          ) : null}
          {r.status === FAILURE_STATUS.IN_PROGRESS ? (
            <>
              <Button
                size="sm"
                onClick={() => resolve.mutate(r.id)}
                disabled={resolve.isPending}
              >
                Resolve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => severe.mutate(r.id)}
                disabled={severe.isPending}
              >
                Mark severe
              </Button>
            </>
          ) : null}
          {r.status === FAILURE_STATUS.SEVERE ? (
            <Link
              to="/maintenance/failures/$failureId/technical-report"
              params={{ failureId: r.id }}
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Write technical report
            </Link>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Failures"
        description="Take cases, intervene, resolve, and escalate severe failures with technical reports."
      />
      {failures.isError ? (
        <ErrorCard
          title="Could not load failures"
          message={getErrorMessage(failures.error)}
        />
      ) : (
        <DataTable
          columns={cols}
          rows={failures.data ?? []}
          isLoading={failures.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No failures reported"
        />
      )}
    </div>
  );
}
