"use client";

import { useRef } from "react";
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

// ============================================================
// REUSABLE FORM INPUTS — used across all admin tabs
// ============================================================

interface TextInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "number";
  hint?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: TextInputProps) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
      />
      {hint && <span className="block text-[10px] text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: TextAreaProps) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-y"
      />
      {hint && <span className="block text-[10px] text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  aspect?: "square" | "video" | "portrait" | "wide";
}

export function ImageInput({
  label,
  value,
  onChange,
  aspect = "video",
}: ImageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspect === "square"
      ? "aspect-square"
      : aspect === "portrait"
      ? "aspect-[3/4]"
      : aspect === "wide"
      ? "aspect-[16/9]"
      : "aspect-video";

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 1024 * 1024 * 2) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
      toast.success("Gambar berhasil diupload");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <span className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
      </span>
      <div className="flex gap-3 items-start">
        <div
          className={`relative ${aspectClass} w-24 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200`}
        >
          {value ? (
            <img
              src={value}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex gap-1">
            <input
              type="text"
              value={value.startsWith("data:") ? "[file uploaded]" : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste URL gambar..."
              disabled={value.startsWith("data:")}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors"
            >
              <Upload className="w-3 h-3" />
              Upload
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="shrink-0 inline-flex items-center px-2 py-1.5 text-xs rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                title="Hapus gambar"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <LinkIcon className="w-2.5 h-2.5" />
            URL gambar atau upload file (max 2MB)
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}

interface StringListEditorProps {
  label: string;
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
}

export function StringListEditor({
  label,
  values,
  onChange,
  placeholder,
}: StringListEditorProps) {
  return (
    <div>
      <span className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </span>
      <div className="space-y-1.5">
        {values.map((val, idx) => (
          <div key={idx} className="flex gap-1">
            <input
              type="text"
              value={val}
              onChange={(e) => {
                const next = [...values];
                next[idx] = e.target.value;
                onChange(next);
              }}
              placeholder={placeholder}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== idx))}
              className="shrink-0 inline-flex items-center px-2 py-1.5 text-xs rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          + Tambah item
        </button>
      </div>
    </div>
  );
}

interface FieldGroupProps {
  title: string;
  children: React.ReactNode;
  description?: string;
}

export function FieldGroup({ title, children, description }: FieldGroupProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div>
        <h4 className="text-sm font-bold text-sky-950">{title}</h4>
        {description && (
          <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
