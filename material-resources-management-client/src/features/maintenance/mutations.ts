import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { FailureCreateInput, TechnicalReportInput } from "@frms/shared";

import { getErrorMessage } from "@/lib/errors";

import { maintenanceApi, type FailureTransition } from "./api";
import { failureQueryKeys } from "./queries";

export function useCreateFailureMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FailureCreateInput) => maintenanceApi.create(body),
    onSuccess: () => {
      toast.success("Failure reported");
      void qc.invalidateQueries({ queryKey: failureQueryKeys.all });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not report failure")),
  });
}

const SUCCESS: Record<FailureTransition, string> = {
  "assign-technician": "Assigned",
  "start-intervention": "Intervention started",
  resolve: "Resolved",
  "mark-severe": "Marked as severe",
  "request-supplier-repair": "Supplier repair requested",
  "request-replacement": "Replacement requested",
};

export function useFailureTransitionMutation(action: FailureTransition) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => maintenanceApi.transition(id, action),
    onSuccess: () => {
      toast.success(SUCCESS[action]);
      void qc.invalidateQueries({ queryKey: failureQueryKeys.all });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Action failed")),
  });
}

export function useTechnicalReportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TechnicalReportInput }) =>
      maintenanceApi.technicalReport(id, body),
    onSuccess: () => {
      toast.success("Technical report saved");
      void qc.invalidateQueries({ queryKey: failureQueryKeys.all });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not save report")),
  });
}
