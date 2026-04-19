import { Button } from "@convex-directory/ui/components/button";
import { Input } from "@convex-directory/ui/components/input";
import { Label } from "@convex-directory/ui/components/label";
import { LocalizedLink } from "@/components/localized-link";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { useIntlayer } from "react-intlayer";

import { authClient } from "@/lib/auth-client";

function getCallbackUrl(redirectTo: string) {
  if (typeof window === "undefined") {
    return redirectTo;
  }

  return new URL(redirectTo, window.location.origin).toString();
}

export default function SignUpForm({
  onSwitchToSignIn,
  redirectTo = "/dashboard",
}: {
  onSwitchToSignIn?: () => void;
  redirectTo?: string;
}) {
  const navigate = useLocalizedNavigate();
  const content = useIntlayer("sign-up-form");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: getCallbackUrl(redirectTo),
        },
        {
          onSuccess: () => {
            void navigate({
              to: "/verify-email",
              search: { email: value.email, redirectTo },
            });
            toast.success(content.successMessage.value);
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, content.fields.name.errorMin.value),
        email: z.email(content.fields.email.errorInvalid.value),
        password: z.string().min(8, content.fields.password.errorMin.value),
      }),
    },
  });

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">{content.title}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{content.fields.name.label}</Label>
                <Input
                  id={field.name}
                  name={field.name}
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
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{content.fields.email.label}</Label>
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
                <Label htmlFor={field.name}>{content.fields.password.label}</Label>
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
              {isSubmitting ? content.submitting : content.submit}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center text-sm">
        {onSwitchToSignIn ? (
          <Button variant="link" onClick={onSwitchToSignIn} className="text-primary">
            {content.alreadyHaveAccount}
          </Button>
        ) : (
          <LocalizedLink to="/sign-in" className="text-primary underline-offset-4 hover:underline">
            {content.alreadyHaveAccount}
          </LocalizedLink>
        )}
      </div>
    </div>
  );
}
