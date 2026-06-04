import { FAILURE_STATUS, type FailureReportDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

import { useFailureTransitionMutation } from "../mutations";
import { useFailuresByStatusQuery } from "../queries";

export function MaintenanceDecisionsPage() {
  const reports = useFailuresByStatusQuery(FAILURE_STATUS.TECHNICAL_REPORT_CREATED);
  const repair = useFailureTransitionMutation("request-supplier-repair");
  const replace = useFailureTransitionMutation("request-replacement");

  const columns: Column<FailureReportDto>[] = [
    { key: "id", header: "Failure", render: (r) => r.id.slice(0, 8) },
    { key: "type", header: "Type", render: (r) => r.type ?? "—" },
    { key: "freq", header: "Frequency", render: (r) => r.frequency ?? "—" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Decision",
      render: (r) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => repair.mutate(r.id)}
            disabled={repair.isPending}
          >
            Request supplier repair
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => replace.mutate(r.id)}
            disabled={replace.isPending}
          >
            Request replacement
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Warranty decisions"
        description="Severe failures with technical reports. Repairs and replacements require active warranty."
      />
      {reports.isError ? (
        <ErrorCard
          title="Could not load decisions"
          message={getErrorMessage(reports.error)}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={reports.data ?? []}
          isLoading={reports.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No severe failures awaiting decision"
        />
      )}
    </div>
  );
}
