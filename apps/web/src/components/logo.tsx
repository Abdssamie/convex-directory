import * as React from "react";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
  white?: boolean;
}

export function Logo({ size = 24, className, white, ...props }: LogoProps) {
  return (
    <img
      src={white ? "/logo-small-white.png" : "/logo-small.png"}
      width={size}
      height={size}
      alt="Convex Directory Logo"
      className={className}
      {...props}
    />
  );
}
