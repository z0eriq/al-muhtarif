"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        dir="rtl"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "font-[family-name:var(--font-cairo)]",
          },
        }}
      />
    </SessionProvider>
  );
}
