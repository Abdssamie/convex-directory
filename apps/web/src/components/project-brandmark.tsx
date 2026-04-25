"use client";

import { useState } from "react";

type ProjectBrandmarkProps = {
  title: string;
  productLogoUrl?: string;
  screenshotUrl?: string;
  className?: string;
  initialsClassName?: string;
};

export function ProjectBrandmark({
  title,
  productLogoUrl,
  screenshotUrl,
  className,
  initialsClassName,
}: ProjectBrandmarkProps) {
  const [src, setSrc] = useState<string | null>(productLogoUrl || screenshotUrl || null);

  if (!src) {
    return <span className={initialsClassName}>{title.substring(0, 2).toUpperCase()}</span>;
  }

  return (
    <img
      src={src}
      alt={`${title} brandmark`}
      className={className}
      onError={() => {
        if (src === productLogoUrl && screenshotUrl && screenshotUrl !== productLogoUrl) {
          setSrc(screenshotUrl);
          return;
        }

        setSrc(null);
      }}
    />
  );
}
