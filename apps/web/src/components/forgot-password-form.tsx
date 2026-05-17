import { Button } from "@convex-hub/ui/components/button";
import { Input } from "@convex-hub/ui/components/input";
import { Label } from "@convex-hub/ui/components/label";
import { LocalizedLink } from "@/components/localized-link";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.requestPasswordReset(
        {
          email: value.email,
          redirectTo: new URL("/reset-password", window.location.origin).toString(),
        },
        {
          onSuccess: () => {
            setSubmittedEmail(value.email);
            toast.success("Reset email sent");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
      }),
    },
  });

  return (
    <div className="space-y-4">
      {submittedEmail ? (
        <div className="border border-border px-3 py-2 text-sm text-muted-foreground">
          If an account exists for {submittedEmail}, a reset link is on the way.
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
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

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Send reset link"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="text-sm text-muted-foreground">
        <LocalizedLink to="/sign-in" className="text-primary underline-offset-4 hover:underline">
          Back to sign in
        </LocalizedLink>
      </div>
    </div>
  );
}
