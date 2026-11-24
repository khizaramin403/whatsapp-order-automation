"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/stores/auth.store";
import { restoreSession } from "@/lib/api";
import { setLocale } from "@/actions/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const emptySubscribe = () => () => {};

function FullPageSessionSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex" aria-busy="true" aria-label="Loading session">
      {/* Desktop Sidebar Skeleton */}
      <aside className="hidden md:flex w-[264px] h-screen sticky top-0 flex-col bg-[#10202D] border-e border-[#22394B] shrink-0">
        <div className="h-16 flex items-center px-4 justify-between border-b border-[#22394B]">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-[8px] bg-[#1B2D3B]" />
            <Skeleton className="h-5 w-28 bg-[#1B2D3B]" />
          </div>
          <Skeleton className="h-8 w-8 rounded-[8px] bg-[#1B2D3B]" />
        </div>
        <div className="flex-1 p-3 space-y-3">
          <Skeleton className="h-3 w-20 bg-[#1B2D3B]" />
          <Skeleton className="h-10 w-full rounded-[8px] bg-[#1B2D3B]" />
          <Skeleton className="h-10 w-full rounded-[8px] bg-[#1B2D3B]" />
          <Skeleton className="h-10 w-full rounded-[8px] bg-[#1B2D3B]" />
        </div>
        <div className="border-t border-[#22394B] p-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <Skeleton className="h-10 w-10 rounded-full bg-[#1B2D3B]" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-24 bg-[#1B2D3B]" />
              <Skeleton className="h-3 w-16 bg-[#1B2D3B]" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-[#E2E5E9] px-4 sm:px-6 flex items-center justify-between shrink-0">
          <Skeleton className="h-7 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-[8px] hidden md:block" />
            <Skeleton className="h-9 w-9 rounded-[8px]" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-20" />
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-[12px]" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentLocale = useLocale();
  const accessToken = useAuth((s) => s.accessToken);
  const isInitialized = useAuth((s) => s.isInitialized);

  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  React.useEffect(() => {
    if (!isClient) return;

    if (isInitialized) {
      if (!accessToken) {
        router.replace("/login");
      }
      return;
    }

    let cancelled = false;

    const runRestore = async () => {
      const profile = await restoreSession();
      if (cancelled) return;

      if (!profile) {
        router.replace("/login");
        return;
      }

      // Sync cookie locale to user's saved language if different
      if (profile.language && profile.language !== currentLocale) {
        await setLocale(profile.language);
        router.refresh();
      }
    };

    void runRestore();

    return () => {
      cancelled = true;
    };
  }, [isClient, accessToken, isInitialized, currentLocale, router]);

  // Show full-page skeleton during SSR hydration, session restoration, or redirect to /login
  if (!isClient || !isInitialized || !accessToken) {
    return <FullPageSessionSkeleton />;
  }

  return <>{children}</>;
}
