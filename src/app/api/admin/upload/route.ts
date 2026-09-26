import { NextRequest } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { requireAuth, jsonError, jsonSuccess } from "@/lib/admin-auth";
import { isR2Configured, uploadImageToR2 } from "@/lib/r2";
import { imageExtensionForFile, resolvedImageContentType } from "@/lib/upload-image";

const MAX_BYTES = 5 * 1024 * 1024;
const FOLDERS = new Set(["products", "categories", "content"]);

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = String(formData.get("folder") ?? "products");

    if (!(file instanceof Blob) || file.size === 0) {
      return jsonError("ملف الصورة مطلوب");
    }

    if (!FOLDERS.has(folderRaw)) {
      return jsonError("مجلد الرفع غير صالح");
    }

    if (file.size > MAX_BYTES) {
      return jsonError("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
    }

    const filenameHint = file instanceof File ? file.name : "";
    const ext = imageExtensionForFile({ type: file.type, name: filenameHint });
    const contentType = resolvedImageContentType({
      type: file.type,
      name: filenameHint,
    });
    if (!ext || !contentType) {
      return jsonError("نوع الملف غير مدعوم. استخدم jpeg/png/webp/gif/svg");
    }

    const buffer = await file.arrayBuffer();
    const filename = `${nanoid(12)}.${ext}`;
    const key = `${folderRaw}/${filename}`;

    if (isR2Configured()) {
      const url = await uploadImageToR2({
        key,
        body: buffer,
        contentType,
      });
      return jsonSuccess({ url }, "تم رفع الصورة بنجاح");
    }

    if (process.env.NODE_ENV === "production") {
      return jsonError(
        "تخزين الصور غير مُعد. أضف مفاتيح Cloudflare R2 ثم أعد النشر.",
        503,
      );
    }

    const dir = path.join(process.cwd(), "public", "uploads", folderRaw);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(buffer));

    return jsonSuccess(
      { url: `/uploads/${folderRaw}/${filename}` },
      "تم رفع الصورة بنجاح",
    );
  } catch (error) {
    console.error("upload error", error);
    if (error instanceof Error && error.message.startsWith("R2 upload failed")) {
      return jsonError("تعذر حفظ الصورة في التخزين. حاول مرة أخرى.", 502);
    }
    return jsonError("فشل رفع الصورة", 500);
  }
}
