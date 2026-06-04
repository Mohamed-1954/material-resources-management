import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { OfferCreateInput } from "@frms/shared";

import { getErrorMessage } from "@/lib/errors";

import { offersApi } from "./api";
import { offerQueryKeys } from "./queries";
import { tenderQueryKeys } from "../tenders/queries";

export function useCreateOfferMutation() {
  return useMutation({
    mutationFn: ({ tenderId, body }: { tenderId: string; body: OfferCreateInput }) =>
      offersApi.createForTender(tenderId, body),
    onError: (error) => toast.error(getErrorMessage(error, "Could not create offer")),
  });
}

export function useSubmitOfferMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offersApi.submit(id),
    onSuccess: () => {
      toast.success("Offer submitted");
      void qc.invalidateQueries({ queryKey: offerQueryKeys.all });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not submit")),
  });
}

export function useEliminateOfferMutation(tenderId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      offersApi.eliminate(id, reason),
    onSuccess: () => {
      toast.success("Offer eliminated");
      void qc.invalidateQueries({
        queryKey: tenderId ? offerQueryKeys.byTender(tenderId) : offerQueryKeys.all,
      });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Eliminate failed")),
  });
}

export function useRejectOfferMutation(tenderId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      offersApi.reject(id, reason),
    onSuccess: () => {
      toast.success("Offer rejected");
      void qc.invalidateQueries({
        queryKey: tenderId ? offerQueryKeys.byTender(tenderId) : offerQueryKeys.all,
      });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Reject failed")),
  });
}

export function useAcceptOfferMutation(tenderId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offersApi.accept(id),
    onSuccess: () => {
      toast.success("Offer accepted; siblings rejected; tender awarded");
      if (tenderId) {
        void qc.invalidateQueries({ queryKey: tenderQueryKeys.detail(tenderId) });
        void qc.invalidateQueries({ queryKey: offerQueryKeys.byTender(tenderId) });
      } else {
        void qc.invalidateQueries({ queryKey: offerQueryKeys.all });
        void qc.invalidateQueries({ queryKey: tenderQueryKeys.all });
      }
    },
    onError: (error) => toast.error(getErrorMessage(error, "Accept failed")),
  });
}
