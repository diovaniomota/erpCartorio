import { Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent">
      <Suspense fallback={null}>
        <AppSidebar />
      </Suspense>
      <div className="relative lg:pl-[272px]">
        <Suspense fallback={null}>
          <AppTopbar />
        </Suspense>
        <main className="animate-fade-in mx-auto w-full max-w-[1480px] space-y-6 bg-slate-50 px-4 py-5 pb-10 lg:px-7 lg:py-7 lg:pb-12">
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
