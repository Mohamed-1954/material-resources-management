import { createFileRoute, redirect } from "@tanstack/react-router";

import { RegisterSupplierPage } from "@/features/auth/pages/RegisterSupplierPage";

export const Route = createFileRoute("/register-supplier")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  },
  component: RegisterSupplierPage,
});
