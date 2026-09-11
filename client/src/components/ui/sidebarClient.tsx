"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
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
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  User,
  Image,
  MapPin,
  CalendarCheck,
  MessageCircle,
  LogOut,
  Menu,
  X,
  History,
  Bell,
  Sun,
  Moon,
  House,
} from "lucide-react";
import useLightModeStore from "@/app/store/displayModeStore";
import NotificationsCount from "./notifCount";

const navigationItems = [
  { title: "Profile", url: "/pages/client/profile", icon: User },
  { title: "Posts", url: "/pages/client/posts", icon: Image },
  { title: "Map", url: "/pages/client/map", icon: MapPin },
  { title: "Booking", url: "/pages/client/bookings", icon: CalendarCheck },
  { title: "Chat", url: "/pages/client/convos", icon: MessageCircle },
  { title: "Transactions", url: "/pages/client/transactions", icon: History },
  { title: "Notifications", url: "/pages/client/notifications", icon: Bell },
];

const bottomNavItems = [
  { title: "Home", url: "/pages/client/profile", icon: House },
  { title: "Posts", url: "/pages/client/posts", icon: Image },
  { title: "Notif", url: "/pages/client/notifications", icon: Bell },
  { title: "Booking", url: "/pages/client/bookings", icon: CalendarCheck },
  { title: "Chat", url: "/pages/client/convos", icon: MessageCircle },
];

interface AppSidebarProps {
  className?: string;
}

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-secondary border-t border-border">
      {/* Ambient gold glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[60px] rounded-full opacity-[0.06] blur-[40px] bg-gold" />

      <div className="flex items-center justify-around px-2 py-2 relative">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              className="group flex flex-col items-center gap-1 px-3 py-1 min-w-[52px]"
            >
              <div
                className={`p-2 border transition-all duration-300 ${
                  isActive
                    ? "bg-surface border-border-gold"
                    : "bg-surface border-border group-hover:border-border-gold"
                }`}
              >
                <item.icon
                  size={15}
                  className={`transition-colors duration-300 ${
                    isActive
                      ? "text-gold"
                      : "text-text-dim group-hover:text-gold"
                  }`}
                />
              </div>
              <span
                className={`text-[9px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isActive ? "text-gold" : "text-text-dim group-hover:text-gold"
                }`}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SidebarClient({ className }: AppSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { lightMode, setLightMode } = useLightModeStore();

  // Apply class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (lightMode) {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light");
    }
  }, [lightMode]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  const logoutHandler = async () => {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    router.push("/guest/login");
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
          <div className="aspect-square size-8 overflow-hidden border border-border">
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
              Client
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
            className="fixed top-0 left-0 w-64 h-full bg-secondary border-r border-border shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drawer Header */}
            <div className="pt-20 px-6 pb-5 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-gold opacity-60" />

                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  Navigation
                </span>

                <button
                  onClick={() => setLightMode(!lightMode)}
                  className="ml-1    flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-alt hover:border-gold transition-colors duration-300"
                  aria-label="Toggle light/dark mode"
                >
                  {lightMode ? (
                    <Moon className="h-4 w-4 text-text-muted" />
                  ) : (
                    <Sun className="h-4 w-4 text-gold" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Nav Items */}
            <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
              <div className="mb-3 px-3">
                <span className="text-[10px] uppercase tracking-[0.28em] text-text-dim">
                  Section
                </span>
              </div>
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={closeMobileMenu}
                    className="group flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-text hover:bg-surface-alt border border-transparent hover:border-border-gold transition-all duration-300"
                  >
                    <div className="bg-surface border border-border group-hover:border-border-gold p-1.5 transition-all duration-300">
                      <item.icon size={13} className="text-gold" />
                    </div>
                    <span className="text-sm tracking-wide">{item.title}</span>{" "}
                    {item.title == "Notifications" && <NotificationsCount />}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="px-4 py-4 border-t border-border">
              <div
                onClick={() => {
                  closeMobileMenu();
                  logoutHandler();
                }}
                className="group flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-danger-light hover:bg-danger-muted border border-transparent hover:border-danger-border cursor-pointer transition-all duration-300"
              >
                <div className="bg-surface border border-border group-hover:border-danger-border p-1.5 transition-all duration-300">
                  <LogOut
                    size={13}
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
                <div className="group flex items-center gap-4">
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
                      Client
                    </span>
                  </div>

                  <button
                    onClick={() => setLightMode(!lightMode)}
                    className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-alt hover:border-gold transition-colors duration-300"
                    aria-label="Toggle light/dark mode"
                  >
                    {lightMode ? (
                      <Moon className="h-4 w-4 text-text-muted" />
                    ) : (
                      <Sun className="h-4 w-4 text-gold" />
                    )}
                  </button>
                </div>
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
                          <item.icon size={13} className="text-gold" />
                        </div>
                        <span className="text-sm tracking-wide">
                          {item.title}
                        </span>{" "}
                        {item.title == "Notifications" && (
                          <NotificationsCount />
                        )}
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
                      size={13}
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
}
