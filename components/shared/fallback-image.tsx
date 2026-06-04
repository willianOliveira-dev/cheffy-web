"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE_SRC = "/images/image-not-found.svg";
const FRONTEND_ASSET_PREFIXES = ["/images/", "/icons/", "/favicon"];

export function FallbackImage({ src, alt, onError, ...props }: ImageProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const normalizedSrc = normalizeImageSrc(src);
  const currentSrc = failedSrc === normalizedSrc ? FALLBACK_IMAGE_SRC : normalizedSrc;

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== FALLBACK_IMAGE_SRC) {
          setFailedSrc(normalizedSrc);
        }
      }}
    />
  );
}

function normalizeImageSrc(src: ImageProps["src"]) {
  if (typeof src !== "string") return src;
  if (!src.startsWith("/") || FRONTEND_ASSET_PREFIXES.some((prefix) => src.startsWith(prefix))) {
    return src;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  return apiUrl ? `${apiUrl}${src}` : src;
}
