"use client"
import Link from "next/link";
import UnauthorizedPage from "@/components/ui/unauthorizedPage";
import useUserStore from "@/app/store/useUserStore";
import { SideBarAdmin } from "@/components/ui/sidebarAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";


export default function AdminLayout({ children }: { children: React.ReactNode }) {

    const {user} = useUserStore()

    if(user?.type != "admin" ) return <UnauthorizedPage />

    return (
      <div className="flex min-h-screen ">
          <SidebarProvider>
                
                <SideBarAdmin />
               
                <main className="w-full">
                    <div className="mb-[80px] md:mb-[0px]"> </div>
                    {children}
                </main>
          </SidebarProvider>
       
      </div>
    );
  }