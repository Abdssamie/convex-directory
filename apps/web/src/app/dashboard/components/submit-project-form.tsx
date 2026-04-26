import { useMutation } from "convex/react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@convex-directory/ui/components/form";
import { Input } from "@convex-directory/ui/components/input";
import { Textarea } from "@convex-directory/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@convex-directory/ui/components/select";
import { Button } from "@convex-directory/ui/components/button";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { toast } from "sonner";
import { useIntlayer } from "react-intlayer";

export function SubmitProjectForm() {
  const submitProject = useMutation(api.projects.submitProject);
  const generateUploadUrl = useMutation(api.r2.generateUploadUrl);
  const syncMetadata = useMutation(api.r2.syncMetadata);
  const content = useIntlayer("submit-project-form");

  const formSchema = z.object({
    title: z.string().min(2, content.validation.titleMin.value),
    description: z.string().min(10, content.validation.descMin.value),
    url: z.string().url(content.validation.urlInvalid.value),
    type: z.enum(["saas", "tool", "open-source", "component"]),
    categorySlug: z.string(),
    logo: z.any().optional(),
    screenshot: z.any().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      type: "saas",
      categorySlug: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const uploadAsset = async (file: File) => {
        const uploadTarget = (await generateUploadUrl({})) as { key: string; url: string };
        const uploadResponse = await fetch(uploadTarget.url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Image upload failed with status ${uploadResponse.status}`);
        }

        await syncMetadata({ key: uploadTarget.key });
        return uploadTarget.key;
      };

      let productLogoKey: string | undefined;
      let screenshotKey: string | undefined;

      if (values.logo?.[0]) productLogoKey = await uploadAsset(values.logo[0]);
      if (values.screenshot?.[0]) screenshotKey = await uploadAsset(values.screenshot[0]);

      const { logo: _logo, screenshot: _screenshot, ...projectData } = values;
      await submitProject({ ...projectData, productLogoKey, screenshotKey });
      toast.success(content.success.value);
      form.reset();
    } catch {
      toast.error(content.error.value);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full p-6 bg-card border rounded-2xl"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content.fields.title.label}</FormLabel>
              <FormControl>
                <Input
                  placeholder={content.fields.title.placeholder.value}
                  {...field}
                  className="rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{content.fields.description.label}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={content.fields.description.placeholder.value}
                  {...field}
                  className="rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.fields.url.label}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={content.fields.url.placeholder.value}
                    {...field}
                    className="rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.fields.type.label}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={content.fields.type.placeholder.value} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="saas">{content.fields.type.options.saas}</SelectItem>
                    <SelectItem value="tool">{content.fields.type.options.tool}</SelectItem>
                    <SelectItem value="open-source">
                      {content.fields.type.options.openSource}
                    </SelectItem>
                    <SelectItem value="component">
                      {content.fields.type.options.component}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categorySlug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.fields.category.label}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={content.fields.category.placeholder.value} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    {PROJECT_CATEGORIES.map((category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="logo"
            render={({ field: { value: _value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>{content.fields.logo.label}</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    type="file"
                    accept="image/*"
                    onChange={(event) => onChange(event.target.files)}
                    className="rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="screenshot"
            render={({ field: { value: _value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>{content.fields.screenshot.label}</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    type="file"
                    accept="image/*"
                    onChange={(event) => onChange(event.target.files)}
                    className="rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full rounded-xl">
          {form.formState.isSubmitting ? content.submitting : content.submit}
        </Button>
      </form>
    </Form>
  );
}
