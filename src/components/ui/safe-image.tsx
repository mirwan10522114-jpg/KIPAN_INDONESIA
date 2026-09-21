"use client";

import { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";

// ============================================================
// SAFE IMAGE — handles empty/invalid src gracefully
// Prevents the "empty string passed to src" console error
// and shows a placeholder instead of broken image
// ============================================================

interface SafeImageProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  placeholderClassName?: string;
  iconClassName?: string;
}

export default function SafeImage({
  src,
  alt,
  className = "",
  loading = "lazy",
  placeholderClassName = "",
  iconClassName = "w-8 h-8",
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // If no src or error occurred, show placeholder
  if (!src || src.trim() === "" || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-slate-300 ${placeholderClassName || className}`}
        role="img"
        aria-label={alt || "No image"}
      >
        <ImageOff className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setHasError(true)}
    />
  );
}
