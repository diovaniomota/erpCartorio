import { Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <AppSidebar />
      </Suspense>
      <div className="lg:pl-72">
        <AppTopbar />
        <main className="animate-fade-in mx-auto w-full max-w-[1600px] space-y-6 p-4 pb-10 lg:p-7 lg:pb-12">{children}</main>
      </div>
    </div>
  );
}
