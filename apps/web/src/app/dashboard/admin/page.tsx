import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex-directory/backend/convex/_generated/api";
import type { Id } from "@convex-directory/backend/convex/_generated/dataModel";
import { BaseLayout } from "@/components/layouts/base-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@convex-directory/ui/components/card";
import { Button } from "@convex-directory/ui/components/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FastProjectUploader } from "@/app/dashboard/components/fast-project-uploader";
import { ProjectCategorySelector } from "@/components/project-category-selector";
import { ProjectLogoField, ProjectScreenshotField } from "@/components/project-media-fields";
import { Check, ExternalLink, Loader2, Search, Star, X } from "lucide-react";
import { toast } from "sonner";
import { useIntlayer } from "react-intlayer";

type AdminProject = FunctionReturnType<typeof api.projects.getProjectsForAdmin>[number];
type AdminProjectStatus = AdminProject["status"];
type ProjectType = AdminProject["type"];

const STATUS_OPTIONS: AdminProjectStatus[] = ["approved", "pending", "rejected"];
const TYPE_OPTIONS: ProjectType[] = ["saas", "tool", "open-source", "component"];

function formatDate(value: number) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function matchesQuery(project: AdminProject, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return [
    project.title,
    project.description,
    project.url,
    project.categorySlugs.join(" "),
    project.type,
    project.status,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

function getStatusBadge(status: AdminProjectStatus) {
  switch (status) {
    case "approved":
      return (
        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">Approved</Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

function getTypeLabel(type: ProjectType) {
  switch (type) {
    case "open-source":
      return "Open Source";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

async function uploadImageFile(
  file: File,
  generateUploadUrl: (args: Record<string, never>) => Promise<{ key: string; url: string }>,
  syncMetadata: (args: { key: string }) => Promise<unknown>,
) {
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const uploadTarget = await generateUploadUrl({});
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
}

function ProjectTableRow({
  project,
  onApprove,
  onReject,
  onToggleFeatured,
  onToggleStaffPick,
}: {
  project: AdminProject;
  onApprove: (id: Id<"projects">) => Promise<void>;
  onReject: (id: Id<"projects">) => Promise<void>;
  onToggleFeatured: (project: AdminProject) => Promise<void>;
  onToggleStaffPick: (project: AdminProject) => Promise<void>;
}) {
  const updateProject = useMutation(api.projects.updateProject);
  const generateUploadUrl = useMutation(api.r2.generateUploadUrl);
  const syncMetadata = useMutation(api.r2.syncMetadata);
  const [isSaving, setIsSaving] = React.useState(false);
  const [title, setTitle] = React.useState(project.title);
  const [description, setDescription] = React.useState(project.description);
  const [url, setUrl] = React.useState(project.url);
  const [type, setType] = React.useState<ProjectType>(project.type);
  const [categorySlugs, setCategorySlugs] = React.useState(project.categorySlugs);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [screenshotFile, setScreenshotFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    setTitle(project.title);
    setDescription(project.description);
    setUrl(project.url);
    setType(project.type);
    setCategorySlugs(project.categorySlugs);
    setLogoFile(null);
    setScreenshotFile(null);
  }, [project]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const productLogoKey =
        logoFile !== null
          ? await uploadImageFile(logoFile, generateUploadUrl, syncMetadata)
          : undefined;
      const screenshotKey =
        screenshotFile !== null
          ? await uploadImageFile(screenshotFile, generateUploadUrl, syncMetadata)
          : undefined;

      await updateProject({
        id: project._id,
        title,
        description,
        url,
        type,
        categorySlugs,
        ...(productLogoKey ? { productLogoKey } : {}),
        ...(screenshotKey ? { screenshotKey } : {}),
      });

      toast.success("Project updated.");
      setLogoFile(null);
      setScreenshotFile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Project update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="min-w-[320px] align-top">
        <div className="space-y-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-xl"
          />
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="rounded-xl"
          />
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Open current URL
            <ExternalLink className="size-3" />
          </a>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 rounded-xl whitespace-normal"
          />
        </div>
      </TableCell>
      <TableCell className="align-top">
        <div className="space-y-2">
          {getStatusBadge(project.status)}
          <p className="text-xs text-muted-foreground">Updated {formatDate(project.updatedAt)}</p>
        </div>
      </TableCell>
      <TableCell className="min-w-[170px] align-top">
        <Select value={type} onValueChange={(value) => setType(value as ProjectType)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {getTypeLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="min-w-[280px] align-top">
        <ProjectCategorySelector
          value={categorySlugs}
          onChange={setCategorySlugs}
          allowEmpty={type === "open-source"}
        />
      </TableCell>
      <TableCell className="min-w-[280px] align-top">
        <div className="space-y-4">
          <ProjectLogoField
            file={logoFile}
            currentUrl={project.productLogoUrl}
            onFileChange={setLogoFile}
          />
          <ProjectScreenshotField
            file={screenshotFile}
            currentUrl={project.screenshotUrl}
            onFileChange={setScreenshotFile}
          />
        </div>
      </TableCell>
      <TableCell className="min-w-[260px] align-top">
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleSave} disabled={isSaving} className="rounded-xl">
            {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Save
          </Button>
          {project.status !== "approved" && (
            <Button type="button" onClick={() => onApprove(project._id)} className="rounded-xl">
              <Check className="mr-2 size-4" />
              Approve
            </Button>
          )}
          {project.status !== "rejected" && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => onReject(project._id)}
              className="rounded-xl"
            >
              <X className="mr-2 size-4" />
              Reject
            </Button>
          )}
          <Button
            type="button"
            variant={project.featured ? "default" : "outline"}
            onClick={() => onToggleFeatured(project)}
            className="rounded-xl"
          >
            <Star className="mr-2 size-4" />
            Featured
          </Button>
          <Button
            type="button"
            variant={project.staffPick ? "default" : "outline"}
            onClick={() => onToggleStaffPick(project)}
            className="rounded-xl"
          >
            Staff pick
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ProjectsAdminTable({
  projects,
  activeStatus,
  onStatusChange,
  onApprove,
  onReject,
  onToggleFeatured,
  onToggleStaffPick,
}: {
  projects: AdminProject[];
  activeStatus: AdminProjectStatus;
  onStatusChange: (status: AdminProjectStatus) => void;
  onApprove: (id: Id<"projects">) => Promise<void>;
  onReject: (id: Id<"projects">) => Promise<void>;
  onToggleFeatured: (project: AdminProject) => Promise<void>;
  onToggleStaffPick: (project: AdminProject) => Promise<void>;
}) {
  const [query, setQuery] = React.useState("");

  const filteredProjects = React.useMemo(() => {
    return [...projects]
      .filter((project) => project.status === activeStatus)
      .filter((project) => matchesQuery(project, query))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [activeStatus, projects, query]);

  const counts = React.useMemo(
    () =>
      STATUS_OPTIONS.reduce<Record<AdminProjectStatus, number>>(
        (acc, status) => {
          acc[status] = projects.filter((project) => project.status === status).length;
          return acc;
        },
        { approved: 0, pending: 0, rejected: 0 },
      ),
    [projects],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
            <p className="text-sm text-muted-foreground">
              Review submitted projects, edit fields inline, and replace images directly in the
              table.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <Button
                key={status}
                variant={activeStatus === status ? "default" : "outline"}
                onClick={() => onStatusChange(status)}
                className="rounded-full"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status]})
              </Button>
            ))}
          </div>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, URL, category, or status"
            className="rounded-xl pl-9"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-12 text-center text-muted-foreground">
          No projects match this status and search filter.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-background/30">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Project</TableHead>
                <TableHead className="w-[12%]">Status</TableHead>
                <TableHead className="w-[14%]">Type</TableHead>
                <TableHead className="w-[16%]">Category</TableHead>
                <TableHead className="w-[18%]">Media</TableHead>
                <TableHead className="w-[12%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <ProjectTableRow
                  key={project._id}
                  project={project}
                  onApprove={onApprove}
                  onReject={onReject}
                  onToggleFeatured={onToggleFeatured}
                  onToggleStaffPick={onToggleStaffPick}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const isAdmin = useQuery(api.projects.isAdminQuery);
  const pendingProjects = useQuery(
    api.projects.getProjectsForAdmin,
    isAdmin ? { status: "pending" } : "skip",
  );
  const approvedProjects = useQuery(
    api.projects.getProjectsForAdmin,
    isAdmin ? { status: "approved" } : "skip",
  );
  const rejectedProjects = useQuery(
    api.projects.getProjectsForAdmin,
    isAdmin ? { status: "rejected" } : "skip",
  );
  const pendingClaims = useQuery(api.claims.getPendingClaims, isAdmin ? {} : "skip");
  const openReports = useQuery(api.reports.getOpenProjectReports, isAdmin ? {} : "skip");
  const content = useIntlayer("dashboard");

  const approveProject = useMutation(api.projects.approveProject);
  const rejectProject = useMutation(api.projects.rejectProject);
  const approveClaim = useMutation(api.claims.approveClaim);
  const rejectClaim = useMutation(api.claims.rejectClaim);
  const resolveProjectReport = useMutation(api.reports.resolveProjectReport);
  const setProjectCuration = useMutation(api.projects.setProjectCuration);
  const [activeStatus, setActiveStatus] = React.useState<AdminProjectStatus>("approved");

  const allProjects = React.useMemo(
    () => [...(approvedProjects ?? []), ...(pendingProjects ?? []), ...(rejectedProjects ?? [])],
    [approvedProjects, pendingProjects, rejectedProjects],
  );

  const handleApproveProject = async (id: Id<"projects">) => {
    try {
      await approveProject({ id });
      toast.success(content.admin.toast.projectApproved);
      if (activeStatus === "pending") {
        setActiveStatus("approved");
      }
    } catch {
      toast.error(content.admin.toast.error);
    }
  };

  const handleResolveReport = async (
    reportId: Id<"projectReports">,
    status: "resolved" | "dismissed",
  ) => {
    try {
      await resolveProjectReport({ reportId, status });
      toast.success("Report updated");
    } catch {
      toast.error(content.admin.toast.error);
    }
  };

  const handleRejectProject = async (id: Id<"projects">) => {
    try {
      await rejectProject({ id });
      toast.success(content.admin.toast.projectRejected);
      if (activeStatus !== "rejected") {
        setActiveStatus("rejected");
      }
    } catch {
      toast.error(content.admin.toast.error);
    }
  };

  const handleApproveClaim = async (claimId: Id<"claims">) => {
    try {
      await approveClaim({ claimId });
      toast.success(content.admin.toast.claimApproved);
    } catch {
      toast.error(content.admin.toast.error);
    }
  };

  const handleRejectClaim = async (claimId: Id<"claims">) => {
    try {
      await rejectClaim({ claimId });
      toast.success(content.admin.toast.claimRejected);
    } catch {
      toast.error(content.admin.toast.error);
    }
  };

  const handleToggleFeatured = async (project: AdminProject) => {
    try {
      await setProjectCuration({ id: project._id, featured: !project.featured });
      toast.success(project.featured ? "Featured removed" : "Marked as featured");
    } catch {
      toast.error(content.admin.toast.error);
    }
  };

  const handleToggleStaffPick = async (project: AdminProject) => {
    try {
      await setProjectCuration({ id: project._id, staffPick: !project.staffPick });
      toast.success(project.staffPick ? "Staff pick removed" : "Marked as staff pick");
    } catch {
      toast.error(content.admin.toast.error);
    }
  };

  if (isAdmin === undefined) {
    return (
      <BaseLayout title={content.admin.title} description={content.admin.checkingAccess}>
        <div className="flex h-svh items-center justify-center">{content.admin.checkingAccess}</div>
      </BaseLayout>
    );
  }

  if (!isAdmin) {
    return (
      <BaseLayout title={content.admin.title} description={content.admin.description}>
        <div className="flex h-svh items-center justify-center">Unauthorized</div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={content.admin.title} description={content.admin.description}>
      <div className="container mx-auto space-y-8 px-4 py-8">
        <ProjectsAdminTable
          projects={allProjects}
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
          onApprove={handleApproveProject}
          onReject={handleRejectProject}
          onToggleFeatured={handleToggleFeatured}
          onToggleStaffPick={handleToggleStaffPick}
        />

        <FastProjectUploader />

        <section>
          <h2 className="mb-4 text-2xl font-bold">{content.admin.claims.title}</h2>
          <div className="grid gap-4">
            {pendingClaims?.length === 0 && (
              <p className="text-muted-foreground">{content.admin.claims.noClaims}</p>
            )}
            {pendingClaims?.map((c) => (
              <Card key={c._id} className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{c.projectTitle}</CardTitle>
                    <CardDescription>{c.projectUrl}</CardDescription>
                    <p className="text-sm text-muted-foreground">
                      Claimant: {c.claimantName} ({c.claimantEmail})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApproveClaim(c._id)} className="rounded-xl">
                      {content.admin.claims.approve}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectClaim(c._id)}
                      className="rounded-xl"
                    >
                      {content.admin.claims.reject}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>
                    {content.admin.claims.reason}: {c.reason}
                  </p>
                  {c.evidenceUrl && (
                    <p className="text-sm">
                      Evidence URL:{" "}
                      <a href={c.evidenceUrl} target="_blank" rel="noopener noreferrer">
                        {c.evidenceUrl}
                      </a>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Project Reports</h2>
          <div className="grid gap-4">
            {openReports?.length === 0 && <p className="text-muted-foreground">No open reports.</p>}
            {openReports?.map((report) => (
              <Card key={report._id} className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{report.projectTitle}</CardTitle>
                    <CardDescription>{report.projectUrl}</CardDescription>
                    <p className="text-sm text-muted-foreground">
                      Submitted {formatDate(report.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleResolveReport(report._id, "resolved")}
                      className="rounded-xl"
                    >
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleResolveReport(report._id, "dismissed")}
                      className="rounded-xl"
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Reason:</span> {report.reason}
                  </p>
                  {report.details && (
                    <p className="whitespace-pre-wrap text-muted-foreground">{report.details}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </BaseLayout>
  );
}
