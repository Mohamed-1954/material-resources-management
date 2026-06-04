import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import { ClipboardList, Cog, FileSpreadsheet, Gavel, PackageCheck } from "lucide-react";

import {
  NEED_STATUS,
  OFFER_STATUS,
  RESOURCE_STATUS,
  TENDER_STATUS,
} from "@frms/shared";

import { buttonVariants } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { ChartCard } from "./ChartCard";
import { StatCard } from "./StatCard";
import { useResourcesQuery } from "../inventory/queries";
import { useNeedsQuery } from "../needs/queries";
import { useOffersQuery } from "../offers/queries";
import { useTendersQuery } from "../tenders/queries";

const TENDER_CHART = {
  count: { label: "Tenders" },
} satisfies ChartConfig;

const OFFER_CHART = {
  count: { label: "Offers", color: "var(--chart-1)" },
} satisfies ChartConfig;

const TENDER_COLOR: Record<string, string> = {
  DRAFT: "var(--muted-foreground)",
  PUBLISHED: "var(--chart-1)",
  CLOSED: "var(--chart-2)",
  EVALUATION: "var(--chart-4)",
  AWARDED: "var(--success)",
  CANCELLED: "var(--destructive)",
};

const TENDER_ORDER = [
  TENDER_STATUS.DRAFT,
  TENDER_STATUS.PUBLISHED,
  TENDER_STATUS.EVALUATION,
  TENDER_STATUS.CLOSED,
  TENDER_STATUS.AWARDED,
  TENDER_STATUS.CANCELLED,
];

const OFFER_ORDER = [
  OFFER_STATUS.SUBMITTED,
  OFFER_STATUS.UNDER_REVIEW,
  OFFER_STATUS.ACCEPTED,
  OFFER_STATUS.REJECTED,
  OFFER_STATUS.ELIMINATED,
  OFFER_STATUS.WITHDRAWN,
];

const HUMAN_OFFER: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  ELIMINATED: "Eliminated",
  WITHDRAWN: "Withdrawn",
};

const HUMAN_TENDER: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  EVALUATION: "Evaluation",
  CLOSED: "Closed",
  AWARDED: "Awarded",
  CANCELLED: "Cancelled",
};

export function ManagerDashboard() {
  const tenders = useTendersQuery();
  const offers = useOffersQuery();
  const needs = useNeedsQuery();
  const resources = useResourcesQuery();

  const activeTenders =
    tenders.data?.filter((t) => t.status === TENDER_STATUS.PUBLISHED).length ?? 0;
  const pendingNeeds =
    needs.data?.filter((n) => n.status === NEED_STATUS.SENT_TO_RESOURCE_MANAGER)
      .length ?? 0;
  const offersToReview =
    offers.data?.filter(
      (o) => o.status === OFFER_STATUS.SUBMITTED || o.status === OFFER_STATUS.UNDER_REVIEW,
    ).length ?? 0;
  const unassigned =
    resources.data?.filter((r) => r.status === RESOURCE_STATUS.AVAILABLE).length ?? 0;

  const tenderData = useMemo(() => {
    const map = new Map<string, number>();
    for (const status of TENDER_ORDER) map.set(status, 0);
    for (const t of tenders.data ?? []) {
      map.set(t.status, (map.get(t.status) ?? 0) + 1);
    }
    return [...map.entries()].map(([status, count]) => ({
      status,
      label: HUMAN_TENDER[status] ?? status,
      count,
      fill: TENDER_COLOR[status] ?? "var(--chart-1)",
    }));
  }, [tenders.data]);

  const offerData = useMemo(() => {
    const map = new Map<string, number>();
    for (const status of OFFER_ORDER) map.set(status, 0);
    for (const o of offers.data ?? []) {
      map.set(o.status, (map.get(o.status) ?? 0) + 1);
    }
    return [...map.entries()].map(([status, count]) => ({
      status,
      label: HUMAN_OFFER[status] ?? status,
      count,
    }));
  }, [offers.data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active tenders" value={activeTenders} hint="Published" icon={Gavel} tone="primary" />
        <StatCard label="Needs awaiting include" value={pendingNeeds} icon={ClipboardList} tone="info" />
        <StatCard label="Offers to evaluate" value={offersToReview} icon={FileSpreadsheet} tone="warning" />
        <StatCard label="Unassigned resources" value={unassigned} icon={PackageCheck} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Tender pipeline"
          description="Distribution of tenders by lifecycle stage"
          actions={
            <Link
              to="/manager/tenders"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Gavel className="size-3.5" />
              <span>Open tenders</span>
            </Link>
          }
        >
          <ChartContainer config={TENDER_CHART} className="h-64 w-full">
            <BarChart data={tenderData} margin={{ left: -12, right: 4, top: 12, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={10} />
              <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {tenderData.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
                <LabelList dataKey="count" position="top" className="fill-foreground text-[10px]" />
              </Bar>
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard
          title="Offer outcomes"
          description="Submitted, accepted, rejected"
          actions={
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Cog className="-mt-0.5 mr-1 inline size-3" />
              Live
            </span>
          }
        >
          <ChartContainer config={OFFER_CHART} className="h-64 w-full">
            <BarChart
              data={offerData}
              layout="vertical"
              margin={{ left: 8, right: 24, top: 4, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                width={88}
              />
              <ChartTooltip content={<ChartTooltipContent nameKey="label" indicator="line" />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="var(--color-count)">
                <LabelList dataKey="count" position="right" className="fill-foreground text-[10px]" />
              </Bar>
            </BarChart>
          </ChartContainer>
        </ChartCard>
      </div>
    </div>
  );
}
