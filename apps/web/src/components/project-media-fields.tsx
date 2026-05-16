"use client";

import * as React from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type SharedMediaFieldProps = {
  file: File | null;
  currentUrl?: string;
  onFileChange: (file: File | null) => void;
};

function inferExtension(type: string) {
  switch (type) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "png";
  }
}

function normalizeClipboardImage(file: File, name: string) {
  const extension = inferExtension(file.type);
  return new File([file], `${name}-${Date.now()}.${extension}`, {
    type: file.type,
    lastModified: Date.now(),
  });
}

function ProjectMediaPasteField({
  label,
  file,
  currentUrl,
  onFileChange,
  aspect,
  fileNamePrefix,
}: SharedMediaFieldProps & {
  label: string;
  aspect: "square" | "video";
  fileNamePrefix: string;
}) {
  const [localPreviewUrl, setLocalPreviewUrl] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (!file) {
      setLocalPreviewUrl(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const previewUrl = localPreviewUrl ?? currentUrl;
  const previewClassName =
    aspect === "square"
      ? "h-16 w-16 rounded-xl border object-cover"
      : "aspect-video w-full rounded-xl border object-cover";
  const emptyClassName =
    aspect === "square"
      ? "flex h-16 w-16 items-center justify-center rounded-xl border border-dashed text-muted-foreground"
      : "flex aspect-video w-full items-center justify-center rounded-xl border border-dashed text-muted-foreground";

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const imageItem = Array.from(event.clipboardData.items).find((item) =>
      item.type.startsWith("image/"),
    );

    if (!imageItem) {
      return;
    }

    const pastedFile = imageItem.getAsFile();
    if (!pastedFile) {
      toast.error(`Could not read pasted ${label.toLowerCase()} image.`);
      return;
    }

    event.preventDefault();
    onFileChange(normalizeClipboardImage(pastedFile, fileNamePrefix));
    toast.success(`${label} pasted from clipboard.`);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div
        tabIndex={0}
        onPaste={handlePaste}
        className="space-y-2 rounded-2xl border border-dashed p-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {previewUrl ? (
          <img src={previewUrl} alt={label} className={previewClassName} />
        ) : (
          <div className={emptyClassName}>
            <ImagePlus className="size-4" />
          </div>
        )}
        <p className="text-xs text-muted-foreground">Click here, then press Cmd/Ctrl+V to paste.</p>
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="rounded-xl"
        />
        {file ? <p className="text-xs text-muted-foreground">{file.name}</p> : null}
      </div>
    </div>
  );
}

export function ProjectLogoField(props: SharedMediaFieldProps) {
  return (
    <ProjectMediaPasteField {...props} label="Logo" aspect="square" fileNamePrefix="project-logo" />
  );
}

export function ProjectScreenshotField(props: SharedMediaFieldProps) {
  return (
    <ProjectMediaPasteField
      {...props}
      label="Screenshot"
      aspect="video"
      fileNamePrefix="project-screenshot"
    />
  );
}
