import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/errors";

import { suppliersApi, type SupplierUpdateInput } from "./api";
import { supplierQueryKeys } from "./queries";

export function useUpdateSupplierMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SupplierUpdateInput }) =>
      suppliersApi.update(id, body),
    onSuccess: () => {
      toast.success("Profile updated");
      void qc.invalidateQueries({ queryKey: supplierQueryKeys.all });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Update failed")),
  });
}

export function useBlacklistSupplierMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      suppliersApi.blacklist(id, reason),
    onSuccess: () => {
      toast.success("Supplier blacklisted");
      void qc.invalidateQueries({ queryKey: supplierQueryKeys.lists() });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Blacklist failed")),
  });
}

export function useRemoveFromBlacklistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.removeFromBlacklist(id),
    onSuccess: () => {
      toast.success("Removed from blacklist");
      void qc.invalidateQueries({ queryKey: supplierQueryKeys.lists() });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Action failed")),
  });
}
