"use client";

import { useState } from "react";

type ProjectScreenshotProps = {
  title: string;
  screenshotUrl?: string;
  className?: string;
  placeholderClassName?: string;
  fallbackLabelClassName?: string;
  imgClassName?: string;
};

export function ProjectScreenshot({
  title,
  screenshotUrl,
  className,
  placeholderClassName,
  fallbackLabelClassName,
  imgClassName,
}: ProjectScreenshotProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={className}>
      <div
        className={
          placeholderClassName ??
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50"
        }
      >
        <span className={fallbackLabelClassName ?? "text-muted-foreground font-bold text-4xl"}>
          {title.charAt(0)}
        </span>
      </div>

      {screenshotUrl && !failed ? (
        <img
          src={screenshotUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          className={`${imgClassName ?? "h-full w-full object-cover"} absolute inset-0 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
