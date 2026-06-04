import { formatDistanceToNow } from "date-fns";

import type { AuditLogDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/errors";

import { useAuditLogsQuery } from "../queries";

const ENTITY_LABELS: Record<string, string> = {
  tender: "Tender",
  department: "Department",
  supplier: "Supplier",
  supplier_offer: "Offer",
  resource: "Resource",
  user: "User",
  need_request: "Need",
  failure_report: "Failure",
};

function entityLabel(type: string): string {
  return ENTITY_LABELS[type] ?? type;
}

// Trim long action keys to "namespace · suffix" so the column stays scannable.
function actionPretty(action: string): { domain: string; tail: string } {
  const [domain, ...rest] = action.split(".");
  return { domain, tail: rest.join(".") || domain };
}

export function AuditLogsPage() {
  const audit = useAuditLogsQuery();

  const columns: Column<AuditLogDto>[] = [
    {
      key: "createdAt",
      header: "When",
      render: (r) => {
        const date = new Date(r.createdAt);
        return (
          <div className="flex flex-col leading-tight">
            <span className="tabular-nums">{date.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          </div>
        );
      },
    },
    {
      key: "user",
      header: "User",
      render: (r) => {
        if (!r.userId) {
          return <span className="text-muted-foreground">System</span>;
        }
        return (
          <div className="flex flex-col leading-tight">
            <span>{r.userName ?? r.userEmail ?? "Unknown"}</span>
            {r.userName && r.userEmail ? (
              <span className="text-xs text-muted-foreground">{r.userEmail}</span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "action",
      header: "Action",
      render: (r) => {
        const { domain, tail } = actionPretty(r.action);
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {domain}
            </Badge>
            <span className="text-xs text-muted-foreground">{tail}</span>
          </div>
        );
      },
    },
    {
      key: "entity",
      header: "Entity",
      render: (r) => (
        <div className="flex flex-col leading-tight">
          <span>
            {entityLabel(r.entityType)}
            {r.entityLabel ? (
              <span className="ml-1 text-muted-foreground"> · {r.entityLabel}</span>
            ) : null}
          </span>
          {r.entityId ? (
            <span className="font-mono text-[10px] text-muted-foreground/70">
              {r.entityId}
            </span>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit logs"
        description="Sensitive actions across the system, newest first."
      />
      {audit.isError ? (
        <ErrorCard
          title="Could not load audit logs"
          message={getErrorMessage(audit.error)}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={audit.data ?? []}
          isLoading={audit.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No audit entries yet"
        />
      )}
    </div>
  );
}
