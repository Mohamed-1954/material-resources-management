import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { TenderCreateInput } from "@frms/shared";

import { getErrorMessage } from "@/lib/errors";

import { tendersApi, type TenderTransition } from "./api";
import { tenderQueryKeys } from "./queries";

export function useCreateTenderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TenderCreateInput) => tendersApi.create(body),
    onSuccess: () => {
      toast.success("Tender drafted");
      void qc.invalidateQueries({ queryKey: tenderQueryKeys.lists() });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to create tender")),
  });
}

const SUCCESS: Record<TenderTransition, string> = {
  publish: "Tender published",
  close: "Tender closed",
  "start-evaluation": "Evaluation started",
  cancel: "Tender cancelled",
};

export function useTransitionTenderMutation(action: TenderTransition) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tendersApi.transition(id, action),
    onSuccess: () => {
      toast.success(SUCCESS[action]);
      void qc.invalidateQueries({ queryKey: tenderQueryKeys.all });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Action failed")),
  });
}
