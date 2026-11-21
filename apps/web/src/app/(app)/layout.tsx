import * as React from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AuthGuard } from "@/components/layout/auth-guard";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { LiveOrderListener } from "@/components/orders/live-order-listener";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <LiveOrderListener />
      <div className="min-h-screen bg-[#F7F7F7] text-[#10202D] flex">
        {/* Desktop Sidebar (hidden on mobile under 768px) */}
        <div className="hidden md:block shrink-0">
          <AppSidebar />
        </div>

        {/* Mobile Off-canvas Sheet Sidebar */}
        <MobileSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-200 ease-out">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            <RoleGuard>
              {children}
            </RoleGuard>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
