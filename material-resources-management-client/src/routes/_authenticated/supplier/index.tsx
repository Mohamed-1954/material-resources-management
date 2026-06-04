import { createFileRoute } from "@tanstack/react-router";

import { SectionLanding } from "@/components/layout/SectionLanding";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/supplier/")({
  beforeLoad: requireRole("SUPPLIER"),
  component: () => <SectionLanding sectionId="supplier" />,
});
