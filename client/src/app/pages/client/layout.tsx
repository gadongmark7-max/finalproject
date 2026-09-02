"use client"
import Link from "next/link";
import UnauthorizedPage from "@/components/ui/unauthorizedPage";
import useUserStore from "@/app/store/useUserStore";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarClient } from "@/components/ui/sidebarClient";
import BanPage from "@/components/ui/banPage";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/ui/loadingScreen";
import { useEffect } from "react";

export default function ClientLayout({ children } : { children: React.ReactNode }) {

    const {user} = useUserStore()

    const router = useRouter()

    useEffect(() => {
        if(user?.pin)  router.push("/guest/otp/" + user._id)
    }, [user])

   
    if(!user) return <UnauthorizedPage />
    if(user.isBan) return <BanPage />
    


    return (
      <div className="flex min-h-screen  bg-primary">
          <SidebarProvider>
                
                <SidebarClient />
               
                <main className="w-full">
                    <div className="mb-[80px] md:mb-[0px]"> </div>
                    {children}
                </main>
          </SidebarProvider>
       
      </div>
    );
  }