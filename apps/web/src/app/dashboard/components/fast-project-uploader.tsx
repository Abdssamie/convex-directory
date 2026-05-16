import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import { AlertCircle, ImagePlus, Loader2, Upload, WandSparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@convex-directory/ui/components/card";
import { Button } from "@convex-directory/ui/components/button";
import { Input } from "@convex-directory/ui/components/input";
import { Textarea } from "@convex-directory/ui/components/textarea";
import { Label } from "@convex-directory/ui/components/label";
import { Badge } from "@convex-directory/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@convex-directory/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectLogoField, ProjectScreenshotField } from "@/components/project-media-fields";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { toast } from "sonner";
import { useIntlayer } from "react-intlayer";

type ProjectType = "saas" | "tool" | "open-source" | "component";

type DraftRow = {
  id: string;
  title: string;
  url: string;
  description: string;
  type: ProjectType;
  categoryLabel: string;
  categorySlug: string;
  logoFile: File | null;
  imageFile: File | null;
};

function makeRowId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeCellValue(value: string) {
  const trimmedValue = value.trim();
  if (trimmedValue === '""' || trimmedValue === "''") {
    return "";
  }

  return trimmedValue;
}

function normalizeCategoryValue(value: string) {
  return value.trim().toLowerCase();
}

function resolveCategorySlug(value: string) {
  const normalizedValue = normalizeCategoryValue(value);
  if (!normalizedValue) {
    return "";
  }

  const matchedCategory = PROJECT_CATEGORIES.find((category) => {
    return (
      normalizeCategoryValue(category.name) === normalizedValue ||
      normalizeCategoryValue(category.slug) === normalizedValue
    );
  });

  return matchedCategory?.slug ?? "";
}

function isValidProjectUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidImageFile(file: File) {
  return file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024;
}

function parseBulkInput(raw: string, defaultType: ProjectType): DraftRow[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.includes("\t")
        ? line.split("\t")
        : line.split("|").map((part) => part.trim());

      const [title = "", url = "", description = "", fourth = ""] = parts;
      const trimmedFourth = normalizeCellValue(fourth);
      const resolvedCategorySlug = resolveCategorySlug(trimmedFourth);

      return {
        id: makeRowId(),
        title: normalizeCellValue(title),
        url: normalizeCellValue(url),
        description: normalizeCellValue(description),
        type: defaultType,
        categoryLabel: trimmedFourth,
        categorySlug: resolvedCategorySlug,
        logoFile: null,
        imageFile: null,
      };
    })
    .filter((row) => row.title && row.url && row.description);
}

export function FastProjectUploader() {
  const bulkCreateProjects = useMutation(api.projects.bulkCreateProjectsByAdmin);
  const generateUploadUrl = useMutation(api.r2.generateUploadUrl);
  const syncMetadata = useMutation(api.r2.syncMetadata);
  const content = useIntlayer("dashboard");

  const [rawInput, setRawInput] = useState("");
  const [defaultType, setDefaultType] = useState<ProjectType>("saas");
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canParse = Boolean(rawInput.trim());

  const readyRows = rows.filter(
    (row) =>
      row.title &&
      isValidProjectUrl(row.url) &&
      row.description &&
      row.categorySlug &&
      (row.logoFile === null || isValidImageFile(row.logoFile)) &&
      (row.imageFile === null || isValidImageFile(row.imageFile)),
  );
  const unresolvedCategoryCount = rows.filter(
    (row) =>
      row.title && row.url && row.description && row.categoryLabel.trim() && !row.categorySlug,
  ).length;

  const handleParse = () => {
    const nextRows = parseBulkInput(rawInput, defaultType);

    if (nextRows.length === 0) {
      toast.error("No valid rows found. Use title | url | description | optional category.");
      return;
    }

    setRows(nextRows);
    if (nextRows.some((row) => row.categoryLabel.trim() && !row.categorySlug)) {
      toast.warning("Some rows have unmatched categories. Fix them before publishing.");
    } else {
      toast.success(`${nextRows.length} projects ready.`);
    }
  };

  const updateRow = (id: string, patch: Partial<DraftRow>) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const handleSubmit = async () => {
    if (readyRows.length === 0) {
      toast.error("No valid rows to submit.");
      return;
    }

    if (unresolvedCategoryCount > 0) {
      toast.error("Fix unresolved categories before publishing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const projects = await Promise.all(
        readyRows.map(async (row) => {
          const uploadImageFile = async (file: File) => {
            if (!isValidImageFile(file)) {
              throw new Error("Images must be valid image files and 5MB or smaller.");
            }

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

          const productLogoKey =
            row.logoFile !== null ? await uploadImageFile(row.logoFile) : undefined;
          const screenshotKey =
            row.imageFile !== null ? await uploadImageFile(row.imageFile) : undefined;

          if (!row.categorySlug) {
            throw new Error(`Unknown category: ${row.categoryLabel || "empty"}`);
          }

          return {
            title: row.title.trim(),
            url: row.url.trim(),
            description: row.description.trim(),
            type: row.type,
            categorySlug: row.categorySlug,
            productLogoKey,
            screenshotKey,
          };
        }),
      );

      const createdIds = await bulkCreateProjects({ projects });
      toast.success(`${createdIds.length} projects published.`);
      setRows([]);
      setRawInput("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bulk upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl border-primary/20">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="rounded-full">{content.admin.bulkUploader.adminOnly}</Badge>
          <Badge variant="outline" className="rounded-full">
            {content.admin.bulkUploader.approvedUnclaimed}
          </Badge>
        </div>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <WandSparkles className="h-5 w-5" />
          {content.admin.bulkUploader.title}
        </CardTitle>
        <CardDescription>
          {content.admin.bulkUploader.description} Imported projects go live approved, but ownership
          stays unclaimed until a real user claims them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-1">
          <div className="space-y-2">
            <Label htmlFor="bulk-project-type">{content.admin.bulkUploader.defaultType}</Label>
            <Select
              value={defaultType}
              onValueChange={(value) => setDefaultType(value as ProjectType)}
            >
              <SelectTrigger id="bulk-project-type" className="rounded-xl">
                <SelectValue placeholder={content.admin.bulkUploader.chooseType.value} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
                <SelectItem value="open-source">Open Source</SelectItem>
                <SelectItem value="component">Component</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bulk-project-input">{content.admin.bulkUploader.pasteRows}</Label>
          <Textarea
            id="bulk-project-input"
            className="min-h-40 rounded-2xl font-mono text-sm"
            placeholder={[
              "Project One | https://project-one.com | AI inbox built with Convex | productivity",
              "Project Two | https://project-two.com | Billing ops for SaaS teams | finance",
            ].join("\n")}
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Use <code>|</code> or tab-separated columns. Format:{" "}
            <code>title | url | description | optional category</code>. Category can be name or
            slug.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleParse} disabled={!canParse} className="rounded-xl">
            <Upload className="mr-2 h-4 w-4" />
            {content.admin.bulkUploader.parseRows}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setRows([]);
              setRawInput("");
            }}
            disabled={!rawInput && rows.length === 0}
            className="rounded-xl"
          >
            {content.admin.bulkUploader.clear}
          </Button>
          <div className="flex items-center text-sm text-muted-foreground">
            {rows.length} parsed · {readyRows.length} ready · {PROJECT_CATEGORIES.length} categories
          </div>
        </div>

        {unresolvedCategoryCount > 0 ? (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
            {unresolvedCategoryCount} row{unresolvedCategoryCount === 1 ? "" : "s"} have unmatched
            categories. Fix them in the Category column before publishing.
          </div>
        ) : null}

        {rows.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Screenshot</TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="align-top">
                        <Input
                          value={row.title}
                          onChange={(event) => updateRow(row.id, { title: event.target.value })}
                          className="min-w-44 rounded-xl"
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Input
                          value={row.url}
                          onChange={(event) => updateRow(row.id, { url: event.target.value })}
                          className="min-w-56 rounded-xl"
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Textarea
                          value={row.description}
                          onChange={(event) =>
                            updateRow(row.id, { description: event.target.value })
                          }
                          className="min-w-72 rounded-xl"
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <ProjectScreenshotField
                          file={row.imageFile}
                          onFileChange={(file) => updateRow(row.id, { imageFile: file })}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <ProjectLogoField
                          file={row.logoFile}
                          onFileChange={(file) => updateRow(row.id, { logoFile: file })}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Select
                          value={row.type}
                          onValueChange={(value) =>
                            updateRow(row.id, { type: value as ProjectType })
                          }
                        >
                          <SelectTrigger className="min-w-36 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="saas">SaaS</SelectItem>
                            <SelectItem value="tool">Tool</SelectItem>
                            <SelectItem value="open-source">Open Source</SelectItem>
                            <SelectItem value="component">Component</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="min-w-52 space-y-2">
                          <Input
                            value={row.categoryLabel}
                            onChange={(event) =>
                              updateRow(row.id, {
                                categoryLabel: event.target.value,
                                categorySlug: resolveCategorySlug(event.target.value),
                              })
                            }
                            placeholder="Developer Tools"
                            className="rounded-xl"
                          />
                          <Select
                            value={row.categorySlug || "__unresolved__"}
                            onValueChange={(value) =>
                              updateRow(row.id, {
                                categorySlug: value === "__unresolved__" ? "" : value,
                                categoryLabel:
                                  value === "__unresolved__"
                                    ? row.categoryLabel
                                    : (PROJECT_CATEGORIES.find(
                                        (category) => category.slug === value,
                                      )?.name ?? row.categoryLabel),
                              })
                            }
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Pick existing category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="__unresolved__">Unmatched / choose one</SelectItem>
                              {PROJECT_CATEGORIES.map((category) => (
                                <SelectItem key={category.slug} value={category.slug}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            {row.categorySlug
                              ? "Matched existing category"
                              : "Unmatched category. Pick existing category."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/20 p-4">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Storage is keys-only. Missing or broken logos fall back to screenshots. Batch
                  creates approved, unclaimed projects immediately.
                </span>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || readyRows.length === 0}
                className="rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {content.admin.bulkUploader.publishing}
                  </>
                ) : (
                  <>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    {content.admin.bulkUploader.publish.value.replace(
                      "{count}",
                      String(readyRows.length),
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
