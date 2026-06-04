import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Role } from "@frms/shared";

import { getErrorMessage } from "@/lib/errors";

import { usersApi } from "./api";
import { userQueryKeys } from "./queries";

export function useSetUserRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => usersApi.setRole(id, role),
    onSuccess: () => {
      toast.success("Role updated");
      void qc.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update role")),
  });
}

export function useSetUserStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "INACTIVE" }) =>
      usersApi.setStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      void qc.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update status")),
  });
}
