import type { ResourceAssignmentDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/errors";

import { useAssignmentsByDepartmentQuery } from "../queries";

export function DepartmentResourcesPage() {
  const auth = useAuth();
  const departmentId = auth.user?.departmentId ?? null;
  const assignments = useAssignmentsByDepartmentQuery(departmentId);

  const cols: Column<ResourceAssignmentDto>[] = [
    { key: "resource", header: "Resource", render: (r) => r.resourceId },
    {
      key: "user",
      header: "Assigned to user",
      render: (r) => r.assignedToUserId ?? "—",
    },
    {
      key: "assignedAt",
      header: "Assigned",
      render: (r) => new Date(r.assignedAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader title="Department resources" />
      {assignments.isError ? (
        <ErrorCard
          title="Could not load resources"
          message={getErrorMessage(assignments.error)}
        />
      ) : (
        <DataTable
          columns={cols}
          rows={assignments.data ?? []}
          isLoading={assignments.isLoading}
          rowKey={(r) => r.id}
          emptyMessage={
            departmentId
              ? "No resources assigned to this department"
              : "You are not currently assigned to a department"
          }
        />
      )}
    </div>
  );
}
