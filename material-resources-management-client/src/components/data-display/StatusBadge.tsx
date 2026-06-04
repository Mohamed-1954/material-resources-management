import { Badge } from "@/components/ui/badge";

type Variant = "default" | "secondary" | "destructive" | "outline" | "ghost";

const STATUS_VARIANTS: Record<string, Variant> = {
  // generic
  ACTIVE: "default",
  INACTIVE: "outline",
  DRAFT: "secondary",
  // needs
  SUBMITTED: "default",
  UNDER_DEPARTMENT_REVIEW: "secondary",
  CHANGES_REQUESTED: "outline",
  APPROVED_BY_DEPARTMENT: "default",
  SENT_TO_RESOURCE_MANAGER: "default",
  INCLUDED_IN_TENDER: "default",
  REJECTED: "destructive",
  // tenders
  PUBLISHED: "default",
  CLOSED: "outline",
  EVALUATION: "secondary",
  AWARDED: "default",
  CANCELLED: "destructive",
  // offers
  UNDER_REVIEW: "secondary",
  ELIMINATED: "destructive",
  ACCEPTED: "default",
  WITHDRAWN: "outline",
  // resources
  AVAILABLE: "default",
  ASSIGNED: "secondary",
  UNDER_MAINTENANCE: "secondary",
  SENT_TO_SUPPLIER: "outline",
  REPLACED: "outline",
  RETIRED: "outline",
  LOST: "destructive",
  // failures
  REPORTED: "secondary",
  IN_PROGRESS: "secondary",
  RESOLVED: "default",
  SEVERE: "destructive",
  TECHNICAL_REPORT_CREATED: "default",
  // suppliers
  BLACKLISTED: "destructive",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANTS[status] ?? "outline";
  return (
    <Badge variant={variant} className={className}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
