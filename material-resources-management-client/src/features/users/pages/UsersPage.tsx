import { ALL_ROLES, type Role, type UserDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { StatusBadge } from "@/components/data-display/StatusBadge";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/errors";
import { roleLabel } from "@/lib/role-labels";

import { useSetUserRoleMutation } from "../mutations";
import { useUsersQuery } from "../queries";

export function UsersPage() {
  const usersQuery = useUsersQuery();
  const setRole = useSetUserRoleMutation();

  const columns: Column<UserDto>[] = [
    { key: "email", header: "Email", render: (r) => r.email },
    { key: "name", header: "Name", render: (r) => r.name ?? "—" },
    {
      key: "role",
      header: "Role",
      render: (r) => (
        <Select
          value={r.role}
          disabled={setRole.isPending}
          onValueChange={(value) =>
            setRole.mutate({ id: r.id, role: (value as Role) ?? r.role })
          }
        >
          <SelectTrigger
            aria-label={`Change role for ${r.email}`}
            size="sm"
            className="h-7"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {ALL_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {roleLabel(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "createdAt",
      header: "Created",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader title="Users" description="Manage user accounts and assigned roles." />
      {usersQuery.isError ? (
        <ErrorCard
          title="Could not load users"
          message={getErrorMessage(usersQuery.error)}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={usersQuery.data ?? []}
          isLoading={usersQuery.isLoading}
          rowKey={(u) => u.id}
          emptyMessage="No users yet"
        />
      )}
    </div>
  );
}
