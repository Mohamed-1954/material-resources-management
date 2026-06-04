import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { ClipboardCheck, ClipboardList, FilePlus2, SendHorizontal } from "lucide-react";

import { NEED_STATUS } from "@frms/shared";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { ChartCard } from "./ChartCard";
import { StatCard } from "./StatCard";
import { useNeedsQuery } from "../needs/queries";

const STAGE_ORDER = [
  NEED_STATUS.SUBMITTED,
  NEED_STATUS.UNDER_DEPARTMENT_REVIEW,
  NEED_STATUS.CHANGES_REQUESTED,
  NEED_STATUS.APPROVED_BY_DEPARTMENT,
  NEED_STATUS.SENT_TO_RESOURCE_MANAGER,
  NEED_STATUS.INCLUDED_IN_TENDER,
  NEED_STATUS.REJECTED,
];

const HUMAN: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_DEPARTMENT_REVIEW: "Under review",
  CHANGES_REQUESTED: "Changes requested",
  APPROVED_BY_DEPARTMENT: "Approved",
  SENT_TO_RESOURCE_MANAGER: "Sent to manager",
  INCLUDED_IN_TENDER: "Included in tender",
  REJECTED: "Rejected",
};

const TONE: Record<string, string> = {
  SUBMITTED: "var(--chart-3)",
  UNDER_DEPARTMENT_REVIEW: "var(--chart-4)",
  CHANGES_REQUESTED: "var(--warning)",
  APPROVED_BY_DEPARTMENT: "var(--chart-2)",
  SENT_TO_RESOURCE_MANAGER: "var(--chart-1)",
  INCLUDED_IN_TENDER: "var(--success)",
  REJECTED: "var(--destructive)",
};

const CONFIG = { count: { label: "Needs" } } satisfies ChartConfig;

export function DepartmentHeadDashboard() {
  const needs = useNeedsQuery();

  const submitted =
    needs.data?.filter((n) => n.status === NEED_STATUS.SUBMITTED).length ?? 0;
  const review =
    needs.data?.filter((n) => n.status === NEED_STATUS.UNDER_DEPARTMENT_REVIEW).length ?? 0;
  const approved =
    needs.data?.filter((n) => n.status === NEED_STATUS.APPROVED_BY_DEPARTMENT).length ?? 0;
  const sent =
    needs.data?.filter((n) => n.status === NEED_STATUS.SENT_TO_RESOURCE_MANAGER).length ?? 0;

  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const status of STAGE_ORDER) map.set(status, 0);
    for (const n of needs.data ?? []) {
      if (map.has(n.status)) map.set(n.status, (map.get(n.status) ?? 0) + 1);
    }
    return [...map.entries()]
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        label: HUMAN[status] ?? status,
        count,
        fill: TONE[status] ?? "var(--chart-1)",
      }));
  }, [needs.data]);

  const total = needs.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending submission" value={submitted} icon={FilePlus2} tone="info" />
        <StatCard label="Under review" value={review} icon={ClipboardList} tone="warning" />
        <StatCard label="Approved" value={approved} hint="Ready to send" icon={ClipboardCheck} tone="success" />
        <StatCard label="Sent to manager" value={sent} icon={SendHorizontal} tone="primary" />
      </div>

      <ChartCard
        title="Needs by stage"
        description={total > 0 ? `${total} need${total === 1 ? "" : "s"} tracked` : "Track the workflow of department needs"}
      >
        {data.length === 0 ? (
          <div className="grid h-64 place-items-center text-xs text-muted-foreground">
            No needs to display yet
          </div>
        ) : (
          <ChartContainer config={CONFIG} className="h-64 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
              <Pie data={data} dataKey="count" nameKey="label" innerRadius={48} outerRadius={92} paddingAngle={2} strokeWidth={2}>
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </ChartCard>
    </div>
  );
}
