"use client";

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
  // Don't render <img> at all if src is empty/undefined/null
  if (!src || src.trim() === "") {
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
      onError={(e) => {
        // Hide broken image and show placeholder instead
        const target = e.currentTarget;
        const parent = target.parentElement;
        if (parent) {
          target.style.display = "none";
          if (!parent.querySelector("[data-placeholder]")) {
            const div = document.createElement("div");
            div.setAttribute("data-placeholder", "true");
            div.className = `flex items-center justify-center bg-slate-100 text-slate-300 w-full h-full absolute inset-0`;
            div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-off"><path d="M2 2l20 20"/><path d="M9 3h11a1 1 0 0 1 1 1v11"/><path d="M9 3a2 2 0 0 0-2 2v.5"/><path d="M3 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.5"/><circle cx="9" cy="9" r="2"/><path d="m15 11-3 3"/></svg>`;
            parent.style.position = "relative";
            parent.appendChild(div);
          }
        }
      }}
    />
  );
}
