import { Button } from "@convex-zen/ui/components/button";
import { Input } from "@convex-zen/ui/components/input";
import { Label } from "@convex-zen/ui/components/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

function getAuthErrorMessage(error: { error: { message?: string; statusText?: string } }) {
  return error.error.message || error.error.statusText || "Authentication failed";
}

export default function SignInForm({
  onSwitchToSignUp,
  redirectTo = "/dashboard",
}: {
  onSwitchToSignUp?: () => void;
  redirectTo?: string;
}) {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: redirectTo,
            });
            toast.success("Sign in successful");
          },
          onError: (error) => {
            toast.error(getAuthErrorMessage(error));

            const message = getAuthErrorMessage(error).toLowerCase();
            if (message.includes("verify") || message.includes("verification")) {
              navigate({
                to: "/verify-email",
                search: {
                  email: value.email,
                  redirectTo,
                },
              });
            }
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Sign In"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 space-y-2 text-center text-sm">
        <div className="flex items-center justify-center gap-4">
          <Link to="/forgot-password" className="text-primary underline-offset-4 hover:underline">
            Forgot password?
          </Link>
          <Link to="/magic-link" className="text-primary underline-offset-4 hover:underline">
            Use magic link
          </Link>
        </div>
        {onSwitchToSignUp ? (
          <Button variant="link" onClick={onSwitchToSignUp} className="text-primary">
            Need an account? Sign Up
          </Button>
        ) : (
          <Link to="/sign-up" className="text-primary underline-offset-4 hover:underline">
            Need an account? Sign Up
          </Link>
        )}
      </div>
    </div>
  );
}
