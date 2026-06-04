import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { NeedCreateInput } from "@frms/shared";

import { getErrorMessage } from "@/lib/errors";

import { needsApi, type NeedTransition } from "./api";
import { needQueryKeys } from "./queries";

export function useCreateNeedMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NeedCreateInput) => needsApi.create(body),
    onSuccess: () => {
      toast.success("Need request created (DRAFT)");
      void qc.invalidateQueries({ queryKey: needQueryKeys.lists() });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to create need")),
  });
}

const SUCCESS_BY_ACTION: Record<NeedTransition, string> = {
  submit: "Submitted to department head",
  approve: "Approved",
  reject: "Rejected",
  "request-changes": "Changes requested",
  "send-to-resource-manager": "Sent to resource manager",
};

export function useTransitionNeedMutation(action: NeedTransition) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => needsApi.transition(id, action),
    onSuccess: () => {
      toast.success(SUCCESS_BY_ACTION[action]);
      void qc.invalidateQueries({ queryKey: needQueryKeys.lists() });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Action failed")),
  });
}
