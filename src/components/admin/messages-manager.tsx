"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, MailOpen, Trash2 } from "lucide-react";
import { buildWhatsAppUrl, contactReplyMessage } from "@/lib/whatsapp";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/admin/data-table";

export type ContactMessageRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type MessagesManagerProps = {
  messages: ContactMessageRow[];
  canManage: boolean;
};

export function MessagesManager({ messages, canManage }: MessagesManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);

  async function patchRead(id: string, isRead: boolean) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.error || "فشل التحديث");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove(id: string) {
    if (!confirm("حذف هذه الرسالة؟")) return;
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.error || "فشل الحذف");
      return;
    }
    toast.success("تم الحذف");
    if (openId === id) setOpenId(null);
    startTransition(() => router.refresh());
  }

  async function openMessage(message: ContactMessageRow) {
    const next = openId === message.id ? null : message.id;
    setOpenId(next);
    if (next && !message.isRead && canManage) {
      await patchRead(message.id, true);
    }
  }

  return (
    <DataTable
      columns={[
        { key: "from", header: "المرسل" },
        { key: "phone", header: "الهاتف" },
        { key: "preview", header: "الرسالة" },
        { key: "status", header: "الحالة" },
        { key: "date", header: "التاريخ" },
        { key: "actions", header: "إجراءات" },
      ]}
      isEmpty={messages.length === 0}
      emptyMessage="لا توجد رسائل بعد"
    >
      {messages.map((message) => {
        const opened = openId === message.id;
        const replyUrl = buildWhatsAppUrl(
          message.phone,
          contactReplyMessage(message.name),
        );

        return (
          <DataTableRow
            key={message.id}
            className={`${pending ? "opacity-60" : ""} ${
              message.isRead ? "" : "bg-primary-light/40"
            }`}
          >
            <DataTableCell>
              <button
                type="button"
                className="text-right"
                onClick={() => openMessage(message)}
              >
                <p className="font-semibold">{message.name}</p>
                {message.email ? (
                  <p className="text-xs text-muted" dir="ltr">
                    {message.email}
                  </p>
                ) : null}
              </button>
            </DataTableCell>
            <DataTableCell dir="ltr">{message.phone}</DataTableCell>
            <DataTableCell>
              {opened ? (
                <p className="max-w-xl whitespace-pre-wrap text-sm leading-7">
                  {message.message}
                </p>
              ) : (
                <p className="max-w-xs truncate text-sm text-muted">
                  {message.message}
                </p>
              )}
            </DataTableCell>
            <DataTableCell>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  message.isRead
                    ? "bg-slate-100 text-muted"
                    : "bg-amber-50 text-warning"
                }`}
              >
                {message.isRead ? "مقروءة" : "جديدة"}
              </span>
            </DataTableCell>
            <DataTableCell className="whitespace-nowrap text-muted">
              {new Date(message.createdAt).toLocaleString("ar-IQ", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </DataTableCell>
            <DataTableCell>
              <div className="flex flex-wrap gap-1">
                <a
                  href={replyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-2 py-1.5 text-xs font-medium text-[#128C7E] hover:bg-emerald-50"
                >
                  واتساب
                </a>
                {canManage ? (
                  <>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-muted hover:bg-primary-light hover:text-primary"
                      title={message.isRead ? "تعليم كغير مقروءة" : "تعليم كمقروءة"}
                      onClick={() => patchRead(message.id, !message.isRead)}
                    >
                      {message.isRead ? (
                        <MailOpen className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-danger"
                      title="حذف"
                      onClick={() => remove(message.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : null}
              </div>
            </DataTableCell>
          </DataTableRow>
        );
      })}
    </DataTable>
  );
}
