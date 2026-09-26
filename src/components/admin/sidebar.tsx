"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Warehouse,
  TicketPercent,
  FileText,
  Settings,
  UserCog,
  LogOut,
  Menu,
  X,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
}> = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, permission: "dashboard:view" },
  { href: "/admin/products", label: "المنتجات", icon: Package, permission: "products:view" },
  { href: "/admin/categories", label: "التصنيفات", icon: FolderTree, permission: "categories:view" },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart, permission: "orders:view" },
  { href: "/admin/messages", label: "الرسائل", icon: Mail, permission: "messages:view" },
  { href: "/admin/customers", label: "العملاء", icon: Users, permission: "customers:view" },
  { href: "/admin/inventory", label: "المخزون", icon: Warehouse, permission: "inventory:view" },
  { href: "/admin/coupons", label: "القسائم", icon: TicketPercent, permission: "coupons:view" },
  { href: "/admin/content", label: "المحتوى", icon: FileText, permission: "content:view" },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings, permission: "settings:view" },
  { href: "/admin/users", label: "المستخدمون", icon: UserCog, permission: "users:view" },
];

type SidebarProps = {
  role: Role;
  storeName?: string;
  unreadMessages?: number;
};

export function AdminSidebar({
  role,
  storeName = "المحترف",
  unreadMessages = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(role, item.permission),
  );

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-white/15 text-white shadow-sm"
                : "text-purple-100/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.href === "/admin/messages" && unreadMessages > 0 ? (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold leading-none text-white">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-40 rounded-xl bg-[#3b0764] p-2.5 text-white shadow-lg lg:hidden"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="إغلاق القائمة"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-gradient-to-b from-[#2e1065] via-[#3b0764] to-[#4c1d95] text-white shadow-2xl transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <BrandLogo href="/" storeNameAr={storeName} size="sm" inverted />
          <button
            type="button"
            className="rounded-lg p-1.5 text-purple-100 hover:bg-white/10 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {nav}

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-purple-100/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
