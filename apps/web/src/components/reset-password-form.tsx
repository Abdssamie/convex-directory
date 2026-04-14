import { Button } from "@convex-zen/ui/components/button";
import { Input } from "@convex-zen/ui/components/input";
import { Label } from "@convex-zen/ui/components/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

export default function ResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.resetPassword(
        {
          newPassword: value.newPassword,
          token,
        },
        {
          onSuccess: () => {
            toast.success("Password updated");
            navigate({ to: "/sign-in" });
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          newPassword: z.string().min(8, "Password must be at least 8 characters"),
          confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
        })
        .refine((value) => value.newPassword === value.confirmPassword, {
          message: "Passwords must match",
          path: ["confirmPassword"],
        }),
    },
  });

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="newPassword">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>New password</Label>
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

        <form.Field name="confirmPassword">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Confirm password</Label>
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

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Reset password"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="text-sm text-muted-foreground">
        <Link to="/sign-in" className="text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
