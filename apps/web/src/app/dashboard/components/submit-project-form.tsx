import { useMutation, useQuery } from "convex/react";
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
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["saas", "tool", "open-source", "component"]),
  categoryId: z.string(),
  image: z.string().optional(),
});

export function SubmitProjectForm() {
  const submitProject = useMutation(api.projects.submitProject);
  const categories = useQuery(api.projects.getCategories);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      type: "saas",
      categoryId: "",
      image: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await submitProject({
        ...values,
        categoryId: values.categoryId as any,
      });
      toast.success("Project submitted successfully! Waiting for approval.");
      form.reset();
    } catch {
      toast.error("Failed to submit project.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl mx-auto p-6 bg-card border rounded-2xl"
      >
        <h2 className="text-2xl font-bold">Submit Your Project</h2>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="My Cool Convex App" {...field} className="rounded-xl" />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="What does it do?" {...field} className="rounded-xl" />
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
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} className="rounded-xl" />
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
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                    <SelectItem value="open-source">Open Source</SelectItem>
                    <SelectItem value="component">Component</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    {categories?.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full rounded-xl">
          Submit for Review
        </Button>
      </form>
    </Form>
  );
}
