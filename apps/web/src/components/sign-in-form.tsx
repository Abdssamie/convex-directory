"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useIntlayer } from "react-intlayer";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { LocalizedLink } from "@/components/localized-link";

export default function SignInForm({
  onSwitchToSignUp,
  redirectTo,
}: {
  onSwitchToSignUp?: () => void;
  redirectTo?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const content = useIntlayer("sign-in-form");

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: redirectTo || "/dashboard",
      },
      {
        onSuccess: () => {
          toast.success(content.success.value);
          location.reload();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || content.error.value);
        },
      },
    );
    setIsLoading(false);
  }

  return (
    <div className="mx-auto max-w-md p-6 bg-card border rounded-2xl shadow-sm">
      <h1 className="mb-6 text-center text-3xl font-bold">{content.title.value}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.email.value}</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} className="rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.password.value}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} className="rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <LocalizedLink to="/forgot-password" className="text-sm text-primary hover:underline">
              {content.forgotPassword.value}
            </LocalizedLink>
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
            {isLoading ? content.signingIn.value : content.signIn.value}
          </Button>
        </form>
      </Form>
      {onSwitchToSignUp && (
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">{content.noAccount.value} </span>
          <button onClick={onSwitchToSignUp} className="font-medium text-primary hover:underline">
            {content.signUp.value}
          </button>
        </div>
      )}
    </div>
  );
}
