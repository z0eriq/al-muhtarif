"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

type TopbarProps = {
  title: string;
  userName: string;
  subtitle?: string;
};

export function AdminTopbar({ title, userName, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0 pr-12 lg:pr-0">
          <h2 className="truncate text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/messages"
            className="relative rounded-xl border border-border bg-white p-2.5 text-muted transition-colors hover:border-primary hover:text-primary"
            aria-label="رسائل التواصل"
          >
            <Bell className="h-5 w-5" />
          </Link>

          <div className="hidden items-center gap-3 rounded-xl border border-border bg-primary-light/40 px-3 py-2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {userName.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
              <p className="text-xs text-muted">مدير النظام</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
