"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth.store";

const emptySubscribe = () => () => {};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuth((s) => s.accessToken);
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  React.useEffect(() => {
    if (isClient && !accessToken) {
      router.replace("/login");
    }
  }, [isClient, accessToken, router]);

  if (!isClient || !accessToken) {
    return null;
  }

  return <>{children}</>;
}
