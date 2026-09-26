"use client";

import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";

type UploadFolder = "products" | "categories" | "content";

type AdminImageUploadProps = {
  folder: UploadFolder;
  value: string;
  onChange: (url: string) => void;
  onBusyChange?: (busy: boolean) => void;
  label?: string;
  hint?: string;
  alt?: string;
  disabled?: boolean;
};

export function AdminImageUpload({
  folder,
  value,
  onChange,
  onBusyChange,
  label = "الصورة",
  hint = "اختر صورة من جهازك وسيتم حفظها تلقائياً",
  alt = "",
  disabled = false,
}: AdminImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const aliveRef = useRef(true);
  const onBusyChangeRef = useRef(onBusyChange);
  const [uploading, setUploading] = useState(false);
  onBusyChangeRef.current = onBusyChange;

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      onBusyChangeRef.current?.(false);
    };
  }, []);

  function setBusy(next: boolean) {
    setUploading(next);
    onBusyChange?.(next);
  }

  async function uploadFile(file: File | undefined) {
    if (!file || disabled) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { url?: string };
      };
      if (!res.ok || !json.success || !json.data?.url) {
        throw new Error(json.error || "فشل الرفع");
      }
      if (!aliveRef.current) return;
      onChange(json.data.url);
      toast.success("تم رفع الصورة");
    } catch (error) {
      if (!aliveRef.current) return;
      toast.error(error instanceof Error ? error.message : "فشل رفع الصورة");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
      if (aliveRef.current) setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => uploadFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={alt || label} className="h-36 w-full object-cover" />
          <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline disabled:opacity-60"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "جاري الرفع..." : "تغيير الصورة"}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted hover:bg-red-50 hover:text-danger disabled:opacity-60"
              disabled={disabled || uploading}
              onClick={() => onChange("")}
            >
              <X className="h-3.5 w-3.5" />
              حذف
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-light/40 px-4 py-8 text-sm text-primary hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-70"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
          {uploading ? "جاري رفع الصورة..." : "رفع صورة"}
        </button>
      )}
    </div>
  );
}
