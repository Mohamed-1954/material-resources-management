import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/errors";

import { departmentsApi, type CreateDepartmentInput } from "./api";
import { departmentQueryKeys } from "./queries";

export function useCreateDepartmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDepartmentInput) => departmentsApi.create(body),
    onSuccess: () => {
      toast.success("Department created");
      void qc.invalidateQueries({ queryKey: departmentQueryKeys.lists() });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to create department")),
  });
}
