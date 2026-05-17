"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "@convex-hub/backend/convex/_generated/api";
import type { Id } from "@convex-hub/backend/convex/_generated/dataModel";
import {
  ExternalLink,
  Calendar,
  Globe,
  User,
  Tag,
  Home,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Link2,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@convex-hub/ui/components/button";
import { Badge } from "@convex-hub/ui/components/badge";
import { Separator } from "@convex-hub/ui/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@convex-hub/ui/components/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@convex-hub/ui/components/dialog";
import { Textarea } from "@convex-hub/ui/components/textarea";
import { Label } from "@convex-hub/ui/components/label";
import { Input } from "@convex-hub/ui/components/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { LocalizedLink } from "@/components/localized-link";
import { ProjectBrandmark } from "@/components/project-brandmark";
import { formatProjectCategoryName } from "@/lib/project-categories";

interface ProductPageProps {
  projectId: Id<"projects">;
}

export function ProductPage({ projectId }: ProductPageProps) {
  const project = useQuery(api.projects.getProjectById, { id: projectId });
  const claimStatus = useQuery(api.claims.getProjectClaimStatus, { projectId });
  const isAdmin = useQuery(api.projects.isAdminQuery);
  const submitClaim = useMutation(api.claims.submitClaim);
  const submitReport = useMutation(api.reports.submitProjectReport);
  const trackProjectEvent = useMutation(api.projects.trackProjectEvent);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (project?._id) {
      void trackProjectEvent({ projectId: project._id, event: "view" });
    }
  }, [project?._id, trackProjectEvent]);

  const primaryCategorySlug = project?.categorySlugs[0] ?? project?.categorySlug;
  const categoryNames = project?.categorySlugs.map((slug) => formatProjectCategoryName(slug)) ?? [];
  const primaryCategoryName = primaryCategorySlug
    ? formatProjectCategoryName(primaryCategorySlug)
    : undefined;

  const formattedDate = project
    ? new Date(project.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const websiteHostname = project?.url
    ? (() => {
        try {
          return new URL(project.url).hostname.replace(/^www\./, "");
        } catch {
          return project.url;
        }
      })()
    : null;

  const handleClaim = async (reason: string, evidenceUrl?: string, evidenceText?: string) => {
    setIsClaiming(true);
    try {
      await submitClaim({ projectId, reason, evidenceUrl, evidenceText });
      toast.success("Claim submitted! We'll review your request shortly.");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit claim.";
      toast.error(message);
      return false;
    } finally {
      setIsClaiming(false);
    }
  };

  const handleVisitWebsite = () => {
    void trackProjectEvent({ projectId, event: "outbound_click" });
  };

  function ClaimOwnershipDialog({
    projectTitle,
    onClaim,
    isClaiming,
  }: {
    projectTitle: string;
    onClaim: (reason: string, evidenceUrl?: string, evidenceText?: string) => Promise<boolean>;
    isClaiming: boolean;
  }) {
    const [reason, setReason] = useState("");
    const [evidenceUrl, setEvidenceUrl] = useState("");
    const [evidenceText, setEvidenceText] = useState("");
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!reason.trim()) {
        toast.error("Please provide a reason for your claim.");
        return;
      }
      const success = await onClaim(reason, evidenceUrl || undefined, evidenceText || undefined);
      if (success) {
        setOpen(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full rounded-xl" size="sm">
            Claim ownership
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Claim {projectTitle}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason for claim</Label>
                <Textarea
                  id="reason"
                  placeholder="I am the founder/developer of this project. You can verify this via..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="rounded-xl min-h-[100px]"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="evidenceUrl">Evidence URL</Label>
                <Input
                  id="evidenceUrl"
                  placeholder="https://github.com/owner/repo or https://yourdomain.com"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="evidenceText">Verification notes</Label>
                <Textarea
                  id="evidenceText"
                  placeholder="Email domain, repository access, launch post, or other proof."
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  className="rounded-xl min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isClaiming} className="rounded-xl">
                {isClaiming ? "Submitting..." : "Submit Claim"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link."));
  };

  function ReportProjectDialog({ projectTitle }: { projectTitle: string }) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      try {
        await submitReport({ projectId, reason, details: details || undefined });
        toast.success("Report submitted.");
        setReason("");
        setDetails("");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to submit report.");
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full rounded-xl gap-2">
            <Flag className="h-3.5 w-3.5" />
            Report listing
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Report {projectTitle}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reportReason">Reason</Label>
                <Input
                  id="reportReason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Broken link, spam, wrong owner..."
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reportDetails">Details</Label>
                <Textarea
                  id="reportDetails"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  className="rounded-xl min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="rounded-xl">
                Submit report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (project === undefined) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <LandingNavbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-10">
          <div className="animate-pulse space-y-8">
            <div className="h-4 w-72 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-muted rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-7 w-48 bg-muted rounded-lg" />
                    <div className="h-4 w-full bg-muted rounded-lg" />
                    <div className="h-4 w-3/4 bg-muted rounded-lg" />
                  </div>
                </div>
                <div className="h-10 w-40 bg-muted rounded-xl" />
                <div className="h-px w-full bg-muted" />
                <div className="h-48 w-full bg-muted rounded-xl" />
              </div>
              <div className="space-y-4">
                <div className="aspect-video w-full bg-muted rounded-xl" />
                <div className="h-40 w-full bg-muted rounded-xl" />
                <div className="h-36 w-full bg-muted rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────────
  if (project === null) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <LandingNavbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Product not found</h1>
          <p className="text-muted-foreground mb-8">
            This product doesn't exist or may have been removed.
          </p>
          <Button asChild>
            <LocalizedLink to="/">Back to home</LocalizedLink>
          </Button>
        </main>
        <LandingFooter />
      </div>
    );
  }

  // ── Main page ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <LandingNavbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 pb-20">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <LocalizedLink to="/" className="flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5" />
                  Home
                </LocalizedLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <LocalizedLink to="/directory">Directory</LocalizedLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {primaryCategorySlug && primaryCategoryName && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <LocalizedLink
                      to="/saas/$categorySlug"
                      params={{ categorySlug: primaryCategorySlug }}
                    >
                      {primaryCategoryName}
                    </LocalizedLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{project.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Left column (2/3) ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-7">
            {/* Product header */}
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                {/* Avatar / logo */}
                <div className="shrink-0 h-16 w-16 rounded-2xl border border-border bg-card shadow-sm flex items-center justify-center overflow-hidden">
                  <ProjectBrandmark
                    key={`${project.productLogoUrl ?? ""}:${project.screenshotUrl ?? ""}`}
                    title={project.title}
                    productLogoUrl={project.productLogoUrl}
                    screenshotUrl={project.screenshotUrl}
                    className="h-full w-full object-cover"
                    initialsClassName="text-xl font-bold text-primary select-none"
                  />
                </div>

                {/* Title, badges, description */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                      {project.title}
                    </h1>
                    {categoryNames.map((categoryName) => (
                      <Badge
                        key={categoryName}
                        variant="outline"
                        className="rounded-full text-xs font-medium shrink-0"
                      >
                        {categoryName}
                      </Badge>
                    ))}
                    {isAdmin && (
                      <Badge
                        variant="outline"
                        className="rounded-full text-xs gap-1 text-muted-foreground shrink-0"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        Admin view
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Visit website CTA */}
              <Button variant="outline" asChild className="gap-2 rounded-xl w-fit">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleVisitWebsite}
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit website
                </a>
              </Button>
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="overview" className="rounded-lg text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="share" className="rounded-lg text-sm">
                  Share
                </TabsTrigger>
              </TabsList>

              {/* ── Overview tab ──────────────────────────────────────────── */}
              <TabsContent value="overview" className="mt-5">
                <div className="bg-card border border-border rounded-xl divide-y divide-border">
                  {/* Description */}
                  <div className="p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-3">Description</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Categories */}
                  <div className="p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-3">Categories</h2>
                    <div className="flex flex-wrap gap-2">
                      {categoryNames.map((categoryName) => (
                        <Badge
                          key={categoryName}
                          variant="outline"
                          className="rounded-full px-3 py-1 text-xs gap-1.5 font-normal"
                        >
                          <Tag className="h-3 w-3 text-primary" />
                          {categoryName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ── Share tab ─────────────────────────────────────────────── */}
              <TabsContent value="share" className="mt-5">
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground mb-1">
                      Share {project.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Help others discover this product by sharing it.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-2"
                      onClick={handleCopyLink}
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Copy link
                    </Button>

                    <Button variant="outline" size="sm" className="rounded-xl gap-2" asChild>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${project.title} — ${project.description}`)}&url=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Share on X / Twitter
                      </a>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Right column (1/3) ────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Screenshot / image */}
            <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {project.screenshotUrl ? (
                <img
                  src={project.screenshotUrl}
                  alt={`${project.title} screenshot`}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-gradient-to-br from-muted to-accent/30">
                  <span className="text-6xl font-bold text-muted-foreground/20 select-none">
                    {project.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Product information card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Product information</h3>
              <Separator className="mb-4" />

              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </span>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline underline-offset-4 font-medium truncate flex items-center gap-1 min-w-0"
                  >
                    <span className="truncate">{websiteHostname}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    Published
                  </span>
                  <span className="text-foreground font-medium">{formattedDate}</span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <User className="h-3.5 w-3.5" />
                    Owner
                  </span>
                  <span
                    className={
                      project.ownerId ? "text-primary font-medium" : "text-muted-foreground"
                    }
                  >
                    {project.ownerId ? "Claimed" : "Unclaimed"}
                  </span>
                </div>
                {project.ownerId && (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verification
                    </span>
                    <span className="text-primary font-medium">Verified owner</span>
                  </div>
                )}
              </div>
            </div>

            {/* Claim ownership / Ask maker card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <Authenticated>
                {/* While claim status is loading */}
                {claimStatus === undefined && (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 w-36 bg-muted rounded" />
                    <div className="h-3.5 w-full bg-muted rounded" />
                    <div className="h-9 w-full bg-muted rounded-xl" />
                  </div>
                )}

                {/* User owns the project */}
                {claimStatus?.isOwner && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <h3 className="text-sm font-semibold text-foreground">
                        You own this product
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You are the verified owner of {project.title}.
                    </p>
                  </div>
                )}

                {/* User has a pending claim */}
                {claimStatus?.hasPendingClaim && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                      <h3 className="text-sm font-semibold text-foreground">
                        Claim pending review
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your ownership claim is under review. We'll get back to you soon.
                    </p>
                  </div>
                )}

                {/* User's claim was approved but not owner yet (edge case) */}
                {claimStatus?.hasApprovedClaim && !claimStatus.isOwner && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <h3 className="text-sm font-semibold text-foreground">Claim approved</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your ownership claim has been approved.
                    </p>
                  </div>
                )}

                {/* User's claim was rejected */}
                {claimStatus?.hasRejectedClaim &&
                  !claimStatus.hasPendingClaim &&
                  !claimStatus.hasApprovedClaim && (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-semibold text-foreground">Claim not approved</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your previous claim was not approved. Contact us if you believe this is a
                        mistake.
                      </p>
                    </div>
                  )}

                {/* User can claim */}
                {claimStatus?.canClaim && (
                  <div className="flex flex-col gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        Claim this product
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Are you the maker of {project.title}? Claim ownership to manage your
                        listing.
                      </p>
                    </div>
                    <ClaimOwnershipDialog
                      projectTitle={project.title}
                      onClaim={handleClaim}
                      isClaiming={isClaiming}
                    />
                  </div>
                )}
              </Authenticated>

              <Unauthenticated>
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      Claim this product
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Are you the maker of {project.title}? Sign in to claim ownership of this
                      listing.
                    </p>
                  </div>
                  <Button asChild className="w-full rounded-xl" size="sm">
                    <LocalizedLink to="/sign-in">Sign in to claim</LocalizedLink>
                  </Button>
                </div>
              </Unauthenticated>
            </div>
            <ReportProjectDialog projectTitle={project.title} />
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
