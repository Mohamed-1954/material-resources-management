import { FAILURE_STATUS, type FailureReportDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/errors";

import { useFailuresByStatusQuery } from "../queries";

export function TechReportsPage() {
  const reports = useFailuresByStatusQuery(FAILURE_STATUS.TECHNICAL_REPORT_CREATED);

  const cols: Column<FailureReportDto>[] = [
    { key: "id", header: "Failure", render: (r) => r.id.slice(0, 8) },
    { key: "type", header: "Type", render: (r) => r.type ?? "—" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Technical reports" description="Severe failures with their technical reports filed." />
      {reports.isError ? (
        <ErrorCard
          title="Could not load technical reports"
          message={getErrorMessage(reports.error)}
        />
      ) : (
        <DataTable
          columns={cols}
          rows={reports.data ?? []}
          isLoading={reports.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No technical reports"
        />
      )}
    </div>
  );
}
