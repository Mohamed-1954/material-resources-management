import type { FailureReportDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/errors";

import { FailureForm } from "../components/FailureForm";
import { useFailuresQuery } from "../queries";
import { useMyAssignmentsQuery } from "../../assignments/queries";

export function TeacherFailuresPage() {
  const my = useMyAssignmentsQuery();
  const failures = useFailuresQuery();

  const allMine = [...(my.data?.personal ?? []), ...(my.data?.department ?? [])];

  const cols: Column<FailureReportDto>[] = [
    { key: "id", header: "Id", render: (r) => r.id.slice(0, 8) },
    { key: "resource", header: "Resource", render: (r) => r.resourceId.slice(0, 8) },
    { key: "type", header: "Type", render: (r) => r.type ?? "—" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report a failure"
        description="Pick one of your resources and describe the issue. A technician will pick it up."
      />
      <FailureForm assignments={allMine} />
      <h2 className="text-sm font-medium">My failure reports</h2>
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
          emptyMessage="No failures yet"
        />
      )}
    </div>
  );
}
