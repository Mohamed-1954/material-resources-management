import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CircleHelp,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { firstFieldError } from "@/lib/form-utils";
import { getErrorMessage } from "@/lib/errors";
import { refreshSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

import { LoginSchema, type LoginInput } from "../schemas";

interface LoginPageProps {
  redirectTo?: string;
}

const defaults: LoginInput = { email: "", password: "" };

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Session-based auth backed by Better-Auth and HTTP-only cookies.",
  },
  {
    icon: Users,
    title: "Role-aware workspaces",
    body: "Tailored dashboards for teachers, managers, technicians and suppliers.",
  },
  {
    icon: Sparkles,
    title: "Fluid workflows",
    body: "Needs, tenders, offers and maintenance — all from one place.",
  },
];

export function LoginPage({ redirectTo }: LoginPageProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: defaults,
    validators: { onSubmit: LoginSchema },
    onSubmit: async ({ value }) => {
      try {
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });
        if (result.error) {
          toast.error(result.error.message ?? "Sign-in failed");
          return;
        }
        await refreshSession(queryClient);
        toast.success("Welcome back");
        await navigate({ to: redirectTo ?? "/dashboard", replace: true });
      } catch (error) {
        toast.error(getErrorMessage(error, "Sign-in failed"));
      }
    },
  });

  return (
    <div className="relative grid min-h-[100dvh] grid-cols-1 bg-background lg:grid-cols-[1.05fr_1fr]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-grid mask-radial-fade opacity-50 dark:opacity-30"
      />

      {/* Brand column */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border/60 bg-card/30 px-10 py-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 size-[420px] rounded-full bg-gradient-to-br from-primary/25 via-primary/5 to-transparent blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-32 size-[420px] rounded-full bg-gradient-to-tr from-[var(--chart-3)]/25 via-transparent to-transparent blur-3xl"
        />
        <BrandMark size="lg" />

        <div className="relative space-y-7">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
              <Sparkles className="size-3 text-primary" />
              <span>Faculty Material Resources</span>
            </div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              Run material lifecycles
              <br />
              with calm precision.
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              From need to tender, offer to assignment, and back to maintenance — every workflow
              for your faculty in one academic-grade workspace.
            </p>
          </div>

          <ul className="space-y-3">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3 backdrop-blur">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <div className="text-sm font-medium">{b.title}</div>
                  <p className="text-xs text-muted-foreground">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          © Ynov Academic · Material Resources Management
        </p>
      </aside>

      {/* Form column */}
      <main className="relative flex flex-col">
        <div className="flex items-center justify-between gap-3 px-6 py-5 lg:px-10">
          <Link
            to="/login"
            aria-label="Faculty Resources"
            className="inline-flex items-center gap-2 lg:hidden"
          >
            <BrandMark size="sm" withWordmark />
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-10">
          <div className="w-full max-w-md space-y-7">
            <header className="space-y-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in with your faculty account to continue.
              </p>
            </header>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void form.handleSubmit();
              }}
              noValidate
              aria-label="Sign in"
            >
              <FieldGroup>
                <form.Field
                  name="email"
                  children={(field) => {
                    const err = firstFieldError(field.state.meta.errors);
                    const invalid = field.state.meta.isTouched && Boolean(err);
                    return (
                      <Field data-invalid={invalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <div className="relative">
                          <Mail
                            aria-hidden="true"
                            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            id={field.name}
                            name={field.name}
                            type="email"
                            autoComplete="email"
                            placeholder="name@faculty.edu"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={invalid}
                            className="pl-8"
                            required
                          />
                        </div>
                        {invalid ? (
                          <FieldDescription className="text-destructive">{err}</FieldDescription>
                        ) : null}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="password"
                  children={(field) => {
                    const err = firstFieldError(field.state.meta.errors);
                    const invalid = field.state.meta.isTouched && Boolean(err);
                    return (
                      <Field data-invalid={invalid}>
                        <div className="flex items-center justify-between">
                          <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <CircleHelp className="size-3" />
                            Contact admin if forgotten
                          </span>
                        </div>
                        <div className="relative">
                          <Lock
                            aria-hidden="true"
                            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            id={field.name}
                            name={field.name}
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={invalid}
                            className="pr-9 pl-8"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            aria-pressed={showPassword}
                            className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </button>
                        </div>
                        {invalid ? (
                          <FieldDescription className="text-destructive">{err}</FieldDescription>
                        ) : null}
                      </Field>
                    );
                  }}
                />

                <form.Subscribe
                  selector={(state) => [state.isSubmitting, state.canSubmit] as const}
                  children={([isSubmitting, canSubmit]) => (
                    <Button
                      type="submit"
                      disabled={isSubmitting || !canSubmit}
                      className={cn("w-full glow", isSubmitting && "pointer-events-none")}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Signing in…</span>
                        </>
                      ) : (
                        <span>Sign in</span>
                      )}
                    </Button>
                  )}
                />
              </FieldGroup>
            </form>

            <FieldSeparator>or continue with</FieldSeparator>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void authClient.signIn.social({
                    provider: "github",
                    callbackURL: "/dashboard",
                  })
                }
              >
                <GithubIcon className="size-3.5" aria-hidden="true" />
                GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/dashboard",
                  })
                }
              >
                <GoogleIcon className="size-3.5" aria-hidden="true" />
                Google
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Are you a supplier?{" "}
              <Link
                to="/register-supplier"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                Register your company
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38l-.01-1.49c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.22.83 1.22.83.72 1.22 1.87.87 2.33.67.07-.52.28-.87.51-1.07-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82A7.7 7.7 0 0 1 8 3.9a7.7 7.7 0 0 1 2 .27c1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.94.29.25.54.74.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" {...props}>
      <path fill="#EA4335" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96L3.91 7.24C4.62 5.05 6.62 3.48 9 3.48z" />
      <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#FBBC05" d="M3.92 10.76A5.41 5.41 0 0 1 3.62 9c0-.61.11-1.2.29-1.76L.96 4.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.96-2.28z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.76L.96 13.04C2.44 15.98 5.48 18 9 18z" />
    </svg>
  );
}
