"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import AdminMessagesCount from "./adminMessageCount";

import {
  LayoutDashboard,
  UserCheck,
  LogOut,
  Menu,
  X,
  Mail,
  User,
  Image,
} from "lucide-react";

const navigationItems = [
  { title: "Verify Artist", url: "/pages/admin/verifyArtist", icon: UserCheck },
  { title: "Users", url: "/pages/admin/users", icon: User },
  { title: "Mail", url: "/pages/admin/mail", icon: Mail },
];

interface AppSidebarProps {
  className?: string;
}

export function SideBarAdmin({ className }: AppSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  const logoutHandler = async () => {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  return (
    <>
      {/* Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient Gold Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Mobile Navbar */}
      <div className="lg:hidden bg-primary text-text p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="aspect-square size-8 overflow-hidden">
            <img
              src="/web/logo.jpg"
              alt="Logo"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col">
            <span
              className="text-gold text-sm font-light tracking-[0.14em] uppercase"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Ink Of Baphomet
            </span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-text-muted">
              Admin
            </span>
          </div>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 hover:bg-surface-alt border border-transparent hover:border-border-gold transition-all duration-300 text-text-muted hover:text-gold"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-primary/80 backdrop-blur-sm"
          onClick={closeMobileMenu}
        >
          <div
            className="fixed top-0 left-0 w-64 h-full bg-secondary border-r border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drawer Header */}
            <div className="pt-20 px-6 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gold opacity-60" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  Navigation
                </span>
              </div>
            </div>

            {/* Mobile Nav Items */}
            <div className="px-4 pt-6">
              <div className="mb-2">
                <span className="text-[10px] uppercase tracking-[0.28em] text-text-dim px-3">
                  Section
                </span>
              </div>
              <nav className="space-y-1 mt-3">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={closeMobileMenu}
                    className="group flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-text hover:bg-surface-alt border border-transparent hover:border-border-gold transition-all duration-300"
                  >
                    <div className="bg-surface border border-border group-hover:border-border-gold p-1.5 transition-all duration-300">
                      <item.icon size={14} className="text-gold" />
                    </div>
                    <span className="text-sm tracking-wide">{item.title}</span>{" "}
                    {item.title == "Mail" && <AdminMessagesCount />}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <div
                onClick={() => {
                  closeMobileMenu();
                  logoutHandler();
                }}
                className="group flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-danger-light hover:bg-danger-muted border border-transparent hover:border-danger-border cursor-pointer transition-all duration-300"
              >
                <div className="bg-surface border border-border group-hover:border-danger-border p-1.5 transition-all duration-300">
                  <LogOut
                    size={14}
                    className="text-text-dim group-hover:text-danger-light"
                  />
                </div>
                <span className="text-sm tracking-wide">Logout</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar
        className={`hidden lg:flex bg-secondary border-r border-border ${className}`}
      >
        {/* Header */}
        <SidebarHeader className="bg-secondary border-b border-border px-6 py-5">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/" className="group flex items-center gap-4">
                  <div className="aspect-square size-8 overflow-hidden border border-border group-hover:border-border-gold transition-all duration-300">
                    <img
                      src="/web/logo.jpg"
                      alt="Logo"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="grid flex-1 text-left leading-tight gap-0.5">
                    <span
                      className="truncate text-gold font-light tracking-[0.14em] uppercase text-sm"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      Ink Of Baphomet
                    </span>
                    <span className="truncate text-[10px] uppercase tracking-[0.28em] text-text-muted">
                      Admin
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="bg-secondary px-2 pt-6">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-px w-4 bg-gold opacity-50" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-text-dim">
                  Section
                </span>
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className="group flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-text hover:bg-surface-alt border border-transparent hover:border-border-gold transition-all duration-300"
                      >
                        <div className="bg-surface border border-border group-hover:border-border-gold p-1.5 transition-all duration-300">
                          <item.icon size={14} className="text-gold" />
                        </div>
                        <span className="text-sm tracking-wide">
                          {item.title}
                        </span>{" "}
                        {item.title == "Mail" && <AdminMessagesCount />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="bg-secondary border-t border-border px-2 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <div
                  onClick={logoutHandler}
                  className="group flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-danger-light hover:bg-danger-muted border border-transparent hover:border-danger-border cursor-pointer transition-all duration-300"
                >
                  <div className="bg-surface border border-border group-hover:border-danger-border p-1.5 transition-all duration-300">
                    <LogOut
                      size={14}
                      className="text-text-dim group-hover:text-danger-light"
                    />
                  </div>
                  <span className="text-sm tracking-wide">Logout</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </>
  );
}
