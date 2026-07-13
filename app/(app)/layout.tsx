import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { AppDataProvider } from "@/lib/client/AppDataProvider";

/**
 * Shared shell for the authenticated app pages (dashboard, history, billing,
 * developers, pricing, profile). The Sidebar and Topbar live here so they stay
 * mounted across client-side navigation — no remount means no flash and the
 * sidebar's collapsed state persists seamlessly between pages.
 *
 * `AppDataProvider` loads the `/dashboard` summary once for the whole shell and
 * redirects to sign-in if the session is invalid.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppDataProvider>
      <div className="flex min-h-screen bg-[#fbfbfe]">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1200px] px-5 py-6 md:px-8">
            <Topbar />
            {children}
          </div>
        </div>
      </div>
    </AppDataProvider>
  );
}
