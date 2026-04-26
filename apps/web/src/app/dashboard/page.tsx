import { BaseLayout } from "@/components/layouts/base-layout";
import { useIntlayer } from "react-intlayer";
import { useQuery } from "convex/react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { PlusCircle, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
