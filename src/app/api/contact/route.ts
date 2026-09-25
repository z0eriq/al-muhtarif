import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب"),
  phone: z
    .string()
    .trim()
    .min(10, "رقم الهاتف غير صالح")
    .regex(/^[0-9+\s-]+$/, "رقم الهاتف غير صالح"),
  email: z
    .string()
    .trim()
    .email("البريد غير صالح")
    .optional()
    .or(z.literal(""))
    .nullable(),
  message: z.string().trim().min(5, "الرسالة قصيرة جداً"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
        },
        { status: 400 },
      );
    }

    // Log for ops visibility; can be wired to email/CRM later
    console.info("[contact]", {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      message: parsed.data.message.slice(0, 500),
      at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "تم استلام رسالتك وسنتواصل معك قريباً",
    });
  } catch (error) {
    console.error("[contact] POST failed", error);
    return NextResponse.json(
      { success: false, error: "تعذر إرسال الرسالة" },
      { status: 500 },
    );
  }
}
