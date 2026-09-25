"use client";
import Link from "next/link";
import UnauthorizedPage from "@/components/ui/unauthorizedPage";
import useUserStore from "@/app/store/useUserStore";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarClient } from "@/components/ui/sidebarClient";
import BanPage from "@/components/ui/banPage";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import LoadingScreen from "@/components/ui/loadingScreen";
import { useEffect } from "react";

const ESTIMATOR_URL = "/pages/client/estimator";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserStore();

  const router = useRouter();
  const pathname = usePathname();
  const showAiShortcut =
    pathname !== ESTIMATOR_URL && !pathname?.startsWith("/pages/client/convo");

  useEffect(() => {
    if (user?.pin) router.push("/otp/" + user._id);
  }, [user]);

  if (!user) return <UnauthorizedPage />;
  if (user.isBan) return <BanPage />;

  return (
    <div className="flex min-h-screen  bg-primary">
      <SidebarProvider>
        <SidebarClient />

        <main className="w-full">
          <div className="mb-[80px] md:mb-[0px]"> </div>
          {children}
        </main>

        {showAiShortcut && (
          <Link
            href={ESTIMATOR_URL}
            aria-label="Open AI Tattoo Price Estimator"
            className="fixed right-4 bottom-24 lg:bottom-6 z-30 flex items-center gap-2 px-4 py-3 bg-gold text-primary border border-gold shadow-lg hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.2em]">
              AI Estimate
            </span>
          </Link>
        )}
      </SidebarProvider>
    </div>
  );
}
