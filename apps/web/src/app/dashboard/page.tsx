import * as React from "react";
import { BaseLayout } from "@/components/layouts/base-layout";
import { useIntlayer } from "react-intlayer";
import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@convex-hub/backend/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { PlusCircle, ExternalLink, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectCategorySelector } from "@/components/project-category-selector";
import { toast } from "sonner";

type UserProject = FunctionReturnType<typeof api.projects.getUserProjects>[number];

function EditProjectDialog({ project }: { project: UserProject }) {
  const updateProject = useMutation(api.projects.updateProject);
  const analytics = useQuery(api.projects.getProjectAnalytics, { projectId: project._id });
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(project.title);
  const [description, setDescription] = React.useState(project.description);
  const [url, setUrl] = React.useState(project.url);
  const [type, setType] = React.useState<UserProject["type"]>(project.type);
  const [categorySlugs, setCategorySlugs] = React.useState(project.categorySlugs);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await updateProject({
        id: project._id,
        title,
        description,
        url,
        type,
        categorySlugs,
      });
      toast.success("Project updated. Sensitive changes may require admin review.");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Project update failed.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="size-4" />
          <span className="sr-only">Edit project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit {project.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={url} onChange={(event) => setUrl(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as UserProject["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="open-source">Open Source</SelectItem>
                  <SelectItem value="component">Component</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categories</Label>
              <ProjectCategorySelector
                value={categorySlugs}
                onChange={setCategorySlugs}
                allowEmpty={type === "open-source"}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28"
            />
          </div>
          {analytics && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              {analytics.views} views · {analytics.outboundClicks} outbound clicks
            </div>
          )}
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Page() {
  const content = useIntlayer("dashboard");
  const projects = useQuery(api.projects.getUserProjects);

  const getStatusBadge = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            {content.submissions.status.approved}
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">{content.submissions.status.rejected}</Badge>;
      default:
        return <Badge variant="secondary">{content.submissions.status.pending}</Badge>;
    }
  };

  return (
    <BaseLayout title={content.page.title} description={content.page.description}>
      <div className="@container/main px-4 lg:px-6 space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{content.submissions.title}</h2>
            <p className="text-muted-foreground">{content.submissions.description}</p>
          </div>
          <Button asChild>
            <LocalizedLink to="/dashboard/submit" className="flex items-center gap-2">
              <PlusCircle className="size-4" />
              {content.submissions.submitNew}
            </LocalizedLink>
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {!projects ? (
            <div className="p-8 text-center text-muted-foreground">Loading submissions...</div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-muted">
                  <PlusCircle className="size-8 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-lg">{content.submissions.noSubmissions}</p>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Start by adding your first project to the directory.
                </p>
              </div>
              <Button asChild variant="outline">
                <LocalizedLink to="/dashboard/submit">
                  {content.submissions.submitNew}
                </LocalizedLink>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{content.submissions.table.title}</TableHead>
                  <TableHead>{content.submissions.table.status}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {content.submissions.table.date}
                  </TableHead>
                  <TableHead className="text-right">{content.submissions.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{project.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1 font-normal md:hidden">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <EditProjectDialog project={project} />
                      <Button variant="ghost" size="icon" asChild>
                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-4" />
                          <span className="sr-only">View website</span>
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </BaseLayout>
  );
}
