"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE_SRC = "/images/image-not-found.svg";

export function FallbackImage({ src, alt, onError, ...props }: ImageProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const currentSrc = failedSrc === src ? FALLBACK_IMAGE_SRC : src;

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== FALLBACK_IMAGE_SRC) {
          setFailedSrc(src);
        }
      }}
    />
  );
}
