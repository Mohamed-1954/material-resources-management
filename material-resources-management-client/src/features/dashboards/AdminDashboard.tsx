import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Building2, ShieldCheck, Users } from "lucide-react";

import type { AuditLogDto } from "@frms/shared";

import { DataTable, type Column } from "@/components/data-display/DataTable";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { roleLabelShort } from "@/lib/role-labels";

import { ChartCard } from "./ChartCard";
import { StatCard } from "./StatCard";
import { useAuditLogsQuery } from "../audit/queries";
import { useDepartmentsQuery } from "../departments/queries";
import { useUsersQuery } from "../users/queries";

const auditCols: Column<AuditLogDto>[] = [
  {
    key: "createdAt",
    header: "When",
    render: (r) => new Date(r.createdAt).toLocaleString(),
  },
  { key: "action", header: "Action", render: (r) => r.action },
  {
    key: "entity",
    header: "Entity",
    render: (r) => `${r.entityType}/${r.entityId ?? ""}`,
  },
];

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "var(--chart-1)",
  RESOURCE_MANAGER: "var(--chart-2)",
  DEPARTMENT_HEAD: "var(--chart-3)",
  TEACHER: "var(--chart-4)",
  SUPPLIER: "var(--chart-5)",
  MAINTENANCE_TECHNICIAN: "var(--primary)",
};

const ACTIVITY_CONFIG = {
  count: { label: "Events", color: "var(--chart-1)" },
} satisfies ChartConfig;

const ROLE_CONFIG = {
  count: { label: "Users" },
} satisfies ChartConfig;

export function AdminDashboard() {
  const users = useUsersQuery();
  const departments = useDepartmentsQuery();
  const audit = useAuditLogsQuery();

  const roleData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const u of users.data ?? []) {
      map[u.role] = (map[u.role] ?? 0) + 1;
    }
    return Object.entries(map).map(([role, count]) => ({
      role,
      label: roleLabelShort(role),
      count,
      fill: ROLE_COLOR[role] ?? "var(--chart-1)",
    }));
  }, [users.data]);

  const activityData = useMemo(() => {
    const buckets = new Map<string, number>();
    const now = new Date();
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, 0);
    }
    for (const log of audit.data ?? []) {
      const key = new Date(log.createdAt).toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return [...buckets.entries()].map(([date, count]) => ({
      date: date.slice(5),
      count,
    }));
  }, [audit.data]);

  const totalUsers = users.data?.length ?? 0;
  const supplierCount =
    users.data?.filter((u) => u.role === "SUPPLIER").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={totalUsers} icon={Users} tone="primary" />
        <StatCard
          label="Departments"
          value={departments.data?.length ?? 0}
          icon={Building2}
          tone="info"
        />
        <StatCard
          label="Suppliers"
          value={supplierCount}
          hint="users with SUPPLIER role"
          icon={ShieldCheck}
          tone="success"
        />
        <StatCard
          label="Audit entries"
          value={audit.data?.length ?? 0}
          hint="last 14 days"
          icon={Activity}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Activity"
          description="Audit events recorded across the platform"
          className="lg:col-span-2"
        >
          <ChartContainer config={ACTIVITY_CONFIG} className="h-64 w-full">
            <BarChart
              data={activityData}
              margin={{ left: -12, right: 4, top: 8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={10} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="var(--color-count)" />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard
          title="Users by role"
          description="Composition of the user base"
        >
          {roleData.length === 0 ? (
            <div className="grid h-64 place-items-center text-xs text-muted-foreground">
              No users yet
            </div>
          ) : (
            <ChartContainer config={ROLE_CONFIG} className="h-64 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
                <Pie
                  data={roleData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={48}
                  outerRadius={84}
                  strokeWidth={2}
                >
                  {roleData.map((entry) => (
                    <Cell key={entry.role} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </ChartCard>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">Recent audit log</h2>
        <DataTable
          columns={auditCols}
          rows={audit.data?.slice(0, 10) ?? []}
          isLoading={audit.isLoading}
          rowKey={(r) => r.id}
          emptyMessage="No audit entries yet"
        />
      </section>
    </div>
  );
}
