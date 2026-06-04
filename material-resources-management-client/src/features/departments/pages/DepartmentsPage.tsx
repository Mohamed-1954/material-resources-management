import type { DepartmentDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/errors";

import { DepartmentForm } from "../components/DepartmentForm";
import { useDepartmentsQuery } from "../queries";

export function DepartmentsPage() {
  const departments = useDepartmentsQuery();

  const columns: Column<DepartmentDto>[] = [
    {
      key: "code",
      header: "Code",
      render: (r) => (
        <span className="font-mono text-xs text-muted-foreground">{r.code}</span>
      ),
    },
    { key: "name", header: "Name", render: (r) => r.name },
    {
      key: "head",
      header: "Head",
      render: (r) => {
        if (!r.headUserId) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-col leading-tight">
            <span>{r.headName ?? r.headEmail ?? "Unnamed head"}</span>
            {r.headName && r.headEmail ? (
              <span className="text-xs text-muted-foreground">{r.headEmail}</span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "members",
      header: "Members",
      render: (r) => (
        <span className="tabular-nums text-muted-foreground">{r.memberCount}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Create departments and assign their heads."
      />
      <DepartmentForm />
      {departments.isError ? (
        <ErrorCard
          title="Could not load departments"
          message={getErrorMessage(departments.error)}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={departments.data ?? []}
          isLoading={departments.isLoading}
          rowKey={(d) => d.id}
          emptyMessage="No departments yet"
        />
      )}
    </div>
  );
}
