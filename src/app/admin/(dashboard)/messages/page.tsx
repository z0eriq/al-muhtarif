import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { AdminTopbar } from "@/components/admin/topbar";
import { MessagesManager } from "@/components/admin/messages-manager";

export const metadata = { title: "رسائل التواصل" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const params = await searchParams;
  const filter = typeof params.filter === "string" ? params.filter : "all";
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const pageSize = ADMIN_PAGE_SIZE;
  const unreadOnly = filter === "unread";

  const where = unreadOnly ? { isRead: false } : {};

  const [filteredTotal, allCount, unreadCount, messages] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));

  return (
    <div className="space-y-6">
      <AdminTopbar
        title="رسائل التواصل"
        subtitle="الرسائل المرسلة من صفحة تواصل معنا"
        userName={session?.user?.name ?? "المدير"}
      />

      <div className="flex flex-wrap gap-2">
        <FilterChip href="/admin/messages" active={!unreadOnly} label={`الكل (${allCount})`} />
        <FilterChip
          href="/admin/messages?filter=unread"
          active={unreadOnly}
          label={`غير مقروءة (${unreadCount})`}
        />
      </div>

      <MessagesManager
        messages={messages.map((item) => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          email: item.email,
          message: item.message,
          isRead: item.isRead,
          createdAt: item.createdAt.toISOString(),
        }))}
        canManage={hasPermission(session?.user?.role, "messages:manage")}
      />

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {filteredTotal} رسالة · صفحة {page} من {totalPages}
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              className="rounded-lg border border-border px-3 py-1.5"
              href={`/admin/messages?${unreadOnly ? "filter=unread&" : ""}page=${page - 1}`}
            >
              السابق
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              className="rounded-lg border border-border px-3 py-1.5"
              href={`/admin/messages?${unreadOnly ? "filter=unread&" : ""}page=${page + 1}`}
            >
              التالي
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-primary text-white"
          : "border border-border bg-white text-muted hover:border-primary hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}
