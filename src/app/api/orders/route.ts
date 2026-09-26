import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators";
import { readRequestCookie, sendMetaCapiEvent } from "@/lib/meta-capi";

const generateOrderCode = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string, limit = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "محاولات كثيرة. حاول بعد دقيقة." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      const issues: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        issues[key] = issues[key] ?? [];
        issues[key].push(issue.message);
      }

      return NextResponse.json(
        {
          success: false,
          error: "بيانات الطلب غير صالحة",
          issues,
        },
        { status: 400 },
      );
    }

    const input = parsed.data;

    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: "ACTIVE",
      },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: "بعض المنتجات غير متاحة" },
        { status: 400 },
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of input.items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `المخزون غير كافٍ للمنتج: ${product.nameAr}`,
          },
          { status: 400 },
        );
      }
    }

    const lineItems = input.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const price = Number(product.price);
      return {
        productId: product.id,
        nameAr: product.nameAr,
        slug: product.slug,
        sku: product.sku,
        price,
        quantity: item.quantity,
        image: product.images[0]?.url ?? null,
        total: price * item.quantity,
      };
    });

    const subtotal = lineItems.reduce((sum, i) => sum + i.total, 0);
    const orderNumber = `AM-${generateOrderCode()}`;

    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { phone: input.customerPhone.trim() },
        create: {
          name: input.customerName.trim(),
          phone: input.customerPhone.trim(),
          email: input.customerEmail?.trim() || null,
          governorate: input.governorate,
          district: input.district.trim(),
          address: input.address.trim(),
          notes: input.notes?.trim() || null,
        },
        update: {
          name: input.customerName.trim(),
          email: input.customerEmail?.trim() || null,
          governorate: input.governorate,
          district: input.district.trim(),
          address: input.address.trim(),
          notes: input.notes?.trim() || null,
        },
      });

      return tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerName: input.customerName.trim(),
          customerPhone: input.customerPhone.trim(),
          customerEmail: input.customerEmail?.trim() || null,
          governorate: input.governorate,
          district: input.district.trim(),
          address: input.address.trim(),
          notes: input.notes?.trim() || null,
          stockCommitted: false,
          paymentMethod: "COD",
          subtotal,
          discount: 0,
          total: subtotal,
          currency: "IQD",
          couponCode: input.couponCode?.trim() || null,
          items: {
            create: lineItems.map((item) => ({
              productId: item.productId,
              nameAr: item.nameAr,
              slug: item.slug,
              sku: item.sku,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              total: item.total,
            })),
          },
        },
        select: {
          orderNumber: true,
          id: true,
          total: true,
        },
      });
    });

    void sendMetaCapiEvent({
      eventName: "Purchase",
      eventId: order.orderNumber,
      eventSourceUrl: `${(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.al-muhtarif.com").replace(/\/$/, "")}/order/${order.orderNumber}`,
      customData: {
        currency: "IQD",
        value: Number(order.total),
        order_id: order.orderNumber,
        content_type: "product",
        content_ids: lineItems.map((item) => item.productId),
        contents: lineItems.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          item_price: item.price,
        })),
        num_items: lineItems.reduce((sum, item) => sum + item.quantity, 0),
      },
      user: {
        email: input.customerEmail,
        phone: input.customerPhone,
        name: input.customerName,
        city: input.governorate,
        clientIp: ip,
        userAgent: request.headers.get("user-agent"),
        fbp: readRequestCookie(request, "_fbp"),
        fbc: readRequestCookie(request, "_fbc"),
        externalId: input.customerPhone,
      },
    }).catch((error) => {
      console.error("[meta-capi] purchase failed", error);
    });

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        orderId: order.id,
        total: Number(order.total),
      },
      message: "تم إنشاء الطلب بنجاح",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK") {
      return NextResponse.json(
        { success: false, error: "تم تحديث المخزون. راجع الكميات وحاول مجدداً." },
        { status: 409 },
      );
    }

    console.error("[orders] POST failed", error);
    return NextResponse.json(
      { success: false, error: "تعذر إنشاء الطلب" },
      { status: 500 },
    );
  }
}
