import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ClipboardList, Layers, PlusCircle, Wrench } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { ChartCard } from "./ChartCard";
import { StatCard } from "./StatCard";
import { useMyAssignmentsQuery } from "../assignments/queries";
import { useFailuresQuery } from "../maintenance/queries";
import { useNeedsQuery } from "../needs/queries";

const ACTIVITY_CONFIG = {
  needs: { label: "Needs", color: "var(--chart-1)" },
  failures: { label: "Failures", color: "var(--chart-5)" },
} satisfies ChartConfig;

function startOfWeek(d: Date): Date {
  const cloned = new Date(d);
  const day = cloned.getDay();
  const diff = (day + 6) % 7;
  cloned.setDate(cloned.getDate() - diff);
  cloned.setHours(0, 0, 0, 0);
  return cloned;
}

export function TeacherDashboard() {
  const my = useMyAssignmentsQuery();
  const needs = useNeedsQuery();
  const failures = useFailuresQuery();

  const personalCount = my.data?.personal.length ?? 0;
  const deptCount = my.data?.department.length ?? 0;

  const activity = useMemo(() => {
    const buckets = new Map<string, { needs: number; failures: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      const key = startOfWeek(d).toISOString().slice(0, 10);
      buckets.set(key, { needs: 0, failures: 0 });
    }
    for (const n of needs.data ?? []) {
      const key = startOfWeek(new Date(n.createdAt)).toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.get(key)!.needs += 1;
    }
    for (const f of failures.data ?? []) {
      const key = startOfWeek(new Date(f.reportedAt)).toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.get(key)!.failures += 1;
    }
    return [...buckets.entries()].map(([date, v]) => ({
      date: date.slice(5),
      needs: v.needs,
      failures: v.failures,
    }));
  }, [needs.data, failures.data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Personal resources" value={personalCount} icon={Layers} tone="primary" />
        <StatCard label="Department resources" value={deptCount} icon={Layers} tone="info" />
        <StatCard label="My need requests" value={needs.data?.length ?? 0} icon={ClipboardList} tone="warning" />
        <StatCard label="My failure reports" value={failures.data?.length ?? 0} icon={Wrench} tone="destructive" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <ChartCard
          title="Activity (last 6 weeks)"
          description="Need requests and failure reports submitted"
        >
          <ChartContainer config={ACTIVITY_CONFIG} className="h-64 w-full">
            <BarChart data={activity} margin={{ left: -12, right: 4, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={10} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Bar dataKey="needs" stackId="a" radius={[0, 0, 0, 0]} fill="var(--color-needs)" />
              <Bar dataKey="failures" stackId="a" radius={[6, 6, 0, 0]} fill="var(--color-failures)" />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Quick actions</h2>
            <p className="text-xs text-muted-foreground">Common workflows for your role.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              to="/teacher/needs"
              className={buttonVariants({ size: "sm", className: "justify-start" })}
            >
              <PlusCircle className="size-3.5" />
              <span>Submit a new need</span>
            </Link>
            <Link
              to="/teacher/failures"
              className={buttonVariants({
                size: "sm",
                variant: "outline",
                className: "justify-start",
              })}
            >
              <Wrench className="size-3.5" />
              <span>Report a failure</span>
            </Link>
            <Button variant="ghost" size="sm" className="justify-start" disabled>
              <ClipboardList className="size-3.5" />
              <span>Browse resources</span>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
