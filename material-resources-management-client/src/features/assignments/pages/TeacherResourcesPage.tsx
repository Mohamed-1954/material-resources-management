import type { ResourceAssignmentDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/errors";

import { useMyAssignmentsQuery } from "../queries";

const cols: Column<ResourceAssignmentDto>[] = [
  { key: "resource", header: "Resource", render: (r) => r.resourceId },
  {
    key: "assignedAt",
    header: "Assigned",
    render: (r) => new Date(r.assignedAt).toLocaleDateString(),
  },
  { key: "notes", header: "Notes", render: (r) => r.notes ?? "—" },
];

export function TeacherResourcesPage() {
  const my = useMyAssignmentsQuery();

  if (my.isError) {
    return (
      <div>
        <PageHeader title="My resources" />
        <ErrorCard
          title="Could not load resources"
          message={getErrorMessage(my.error)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My resources" description="Hardware assigned to you and to your department." />
      <section className="space-y-3">
        <h2 className="text-sm font-medium">Assigned to me</h2>
        <DataTable
          columns={cols}
          rows={my.data?.personal ?? []}
          isLoading={my.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No personal resources"
        />
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-medium">My department</h2>
        <DataTable
          columns={cols}
          rows={my.data?.department ?? []}
          isLoading={my.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No department resources"
        />
      </section>
    </div>
  );
}
