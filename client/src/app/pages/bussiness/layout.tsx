"use client"
import Link from "next/link";
import UnauthorizedPage from "@/components/ui/unauthorizedPage";
import useUserStore from "@/app/store/useUserStore";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarBussiness } from "@/components/ui/sideBarBussiness";
import FreeTRial from "@/components/ui/freeTrial";
import SubscriptionExpired from "@/components/ui/subscriptionExpired";
import { toast } from "sonner";
import DocumentWarnings from "@/components/ui/documentExpirationWarning";
import BanPage from "@/components/ui/banPage";

export default function BussinessLayout({ children }: { children: React.ReactNode }) {

    const {user} = useUserStore()

    if(!user) return <UnauthorizedPage />
    if(user.type != "bussiness" && user.type != "employee") return <UnauthorizedPage />
    if(user.isBan) return <BanPage />
    if(user.subscriptionExpiration == null) return <FreeTRial />

  

  

    return (
      <div className="flex min-h-screen relative ">
          <DocumentWarnings />
          <SidebarProvider>
                
                <SidebarBussiness />
               
                <main className="w-full overflow-hidden">
                    <div className="mb-[80px] md:mb-[0px]"> </div>
                    {children}
                </main>
          </SidebarProvider>
      </div>
    );
  }