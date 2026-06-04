import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { AlertOctagon, Hammer, ListTodo, Wrench } from "lucide-react";

import { FAILURE_STATUS } from "@frms/shared";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { ChartCard } from "./ChartCard";
import { StatCard } from "./StatCard";
import { useFailuresQuery } from "../maintenance/queries";

const ORDER = [
  FAILURE_STATUS.REPORTED,
  FAILURE_STATUS.ASSIGNED,
  FAILURE_STATUS.IN_PROGRESS,
  FAILURE_STATUS.RESOLVED,
  FAILURE_STATUS.SEVERE,
  FAILURE_STATUS.TECHNICAL_REPORT_CREATED,
  FAILURE_STATUS.SENT_TO_SUPPLIER,
];

const HUMAN: Record<string, string> = {
  REPORTED: "Reported",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  SEVERE: "Severe",
  TECHNICAL_REPORT_CREATED: "Report created",
  SENT_TO_SUPPLIER: "Sent to supplier",
};

const TONE: Record<string, string> = {
  REPORTED: "var(--chart-1)",
  ASSIGNED: "var(--chart-2)",
  IN_PROGRESS: "var(--chart-4)",
  RESOLVED: "var(--success)",
  SEVERE: "var(--destructive)",
  TECHNICAL_REPORT_CREATED: "var(--chart-3)",
  SENT_TO_SUPPLIER: "var(--chart-5)",
};

const CONFIG = { count: { label: "Failures" } } satisfies ChartConfig;

export function TechnicianDashboard() {
  const failures = useFailuresQuery();

  const open =
    failures.data?.filter(
      (f) => f.status === FAILURE_STATUS.REPORTED || f.status === FAILURE_STATUS.ASSIGNED,
    ).length ?? 0;
  const inProgress =
    failures.data?.filter((f) => f.status === FAILURE_STATUS.IN_PROGRESS).length ?? 0;
  const severe =
    failures.data?.filter((f) => f.status === FAILURE_STATUS.SEVERE).length ?? 0;

  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of ORDER) map.set(s, 0);
    for (const f of failures.data ?? []) {
      if (map.has(f.status)) map.set(f.status, (map.get(f.status) ?? 0) + 1);
    }
    return [...map.entries()].map(([status, count]) => ({
      status,
      label: HUMAN[status] ?? status,
      count,
      fill: TONE[status] ?? "var(--chart-1)",
    }));
  }, [failures.data]);

  const total = failures.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open" value={open} icon={ListTodo} tone="warning" />
        <StatCard label="In progress" value={inProgress} icon={Hammer} tone="primary" />
        <StatCard label="Severe" value={severe} hint="Needs technical report" icon={AlertOctagon} tone="destructive" />
        <StatCard label="Total" value={total} icon={Wrench} tone="default" />
      </div>

      <ChartCard
        title="Failures by status"
        description={total > 0 ? `${total} failure${total === 1 ? "" : "s"} across all stages` : "Track the maintenance queue"}
      >
        {total === 0 ? (
          <div className="grid h-64 place-items-center text-xs text-muted-foreground">
            No failures reported yet
          </div>
        ) : (
          <ChartContainer config={CONFIG} className="h-64 w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 0 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                width={120}
              />
              <ChartTooltip content={<ChartTooltipContent nameKey="label" indicator="line" />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
                <LabelList dataKey="count" position="right" className="fill-foreground text-[10px]" />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </ChartCard>
    </div>
  );
}
