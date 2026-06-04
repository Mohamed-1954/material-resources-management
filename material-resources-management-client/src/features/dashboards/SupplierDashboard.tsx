import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { CheckCircle2, FileSpreadsheet, Gavel, X } from "lucide-react";

import { OFFER_STATUS } from "@frms/shared";

import { buttonVariants } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { ChartCard } from "./ChartCard";
import { StatCard } from "./StatCard";
import { useOffersQuery } from "../offers/queries";
import { useActiveTendersQuery } from "../tenders/queries";

const ORDER = [
  OFFER_STATUS.SUBMITTED,
  OFFER_STATUS.UNDER_REVIEW,
  OFFER_STATUS.ACCEPTED,
  OFFER_STATUS.REJECTED,
  OFFER_STATUS.ELIMINATED,
  OFFER_STATUS.WITHDRAWN,
];

const HUMAN: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  ELIMINATED: "Eliminated",
  WITHDRAWN: "Withdrawn",
};

const TONE: Record<string, string> = {
  SUBMITTED: "var(--chart-1)",
  UNDER_REVIEW: "var(--chart-4)",
  ACCEPTED: "var(--success)",
  REJECTED: "var(--destructive)",
  ELIMINATED: "var(--muted-foreground)",
  WITHDRAWN: "var(--chart-3)",
};

const CONFIG = { count: { label: "Offers" } } satisfies ChartConfig;

export function SupplierDashboard() {
  const tenders = useActiveTendersQuery();
  const offers = useOffersQuery();

  const submitted =
    offers.data?.filter(
      (o) => o.status === OFFER_STATUS.SUBMITTED || o.status === OFFER_STATUS.UNDER_REVIEW,
    ).length ?? 0;
  const accepted = offers.data?.filter((o) => o.status === OFFER_STATUS.ACCEPTED).length ?? 0;
  const rejected = offers.data?.filter((o) => o.status === OFFER_STATUS.REJECTED).length ?? 0;
  const total = offers.data?.length ?? 0;
  const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of ORDER) map.set(s, 0);
    for (const o of offers.data ?? []) {
      if (map.has(o.status)) map.set(o.status, (map.get(o.status) ?? 0) + 1);
    }
    return [...map.entries()]
      .filter(([, c]) => c > 0)
      .map(([status, count]) => ({
        status,
        label: HUMAN[status] ?? status,
        count,
        fill: TONE[status] ?? "var(--chart-1)",
      }));
  }, [offers.data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active tenders" value={tenders.data?.length ?? 0} icon={Gavel} tone="primary" />
        <StatCard label="Offers under review" value={submitted} icon={FileSpreadsheet} tone="info" />
        <StatCard label="Accepted" value={accepted} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected" value={rejected} icon={X} tone="destructive" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
        <ChartCard
          title="Offer outcomes"
          description={total > 0 ? `${acceptanceRate}% acceptance rate across ${total} offer${total === 1 ? "" : "s"}` : "Submit your first offer to begin tracking"}
          actions={
            <Link
              to="/supplier/tenders"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Gavel className="size-3.5" />
              <span>Browse tenders</span>
            </Link>
          }
        >
          {data.length === 0 ? (
            <div className="grid h-64 place-items-center text-xs text-muted-foreground">
              No offers yet
            </div>
          ) : (
            <ChartContainer config={CONFIG} className="h-64 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
                <Pie data={data} dataKey="count" nameKey="label" innerRadius={48} outerRadius={92} strokeWidth={2}>
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </ChartCard>

        <section className="flex flex-col justify-between gap-4 rounded-xl border border-border/60 bg-card p-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Tip
            </div>
            <h2 className="text-sm font-semibold tracking-tight">
              Submit a competitive offer
            </h2>
            <p className="text-xs text-muted-foreground">
              Faster response times and detailed specs measurably improve your acceptance rate.
              Open tenders below to see the current bid pipeline.
            </p>
          </div>
          <Link
            to="/supplier/offers"
            className={buttonVariants({ size: "sm" })}
          >
            <FileSpreadsheet className="size-3.5" />
            <span>Review my offers</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
