"use client"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
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
} from "@/components/ui/sidebar"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  MessageCircle,
  Package,
  LogOut,
  Menu,
  X,
  Calendar,
  History,
  Bell,
  Users2,
  User,
  Shield,
  DollarSign,
  DollarSignIcon,
  LucideCircleDollarSign,
  Crown,
  File,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun
} from "lucide-react"
import useUserStore from "@/app/store/useUserStore"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { employeeInterface } from "@/app/types/accounts.type"
import useLightModeStore from "@/app/store/displayModeStore"
import NotificationsCount from "./notifCount"

// ─── Nav Structure ───────────────────────────────────────────────────────────── days

interface NavItem {
  feature: string
  title: string
  url: string
  icon: React.ElementType
}

interface NavCategory {
  label: string
  items: NavItem[]
}




const NAV_CATEGORIES: NavCategory[] = [
  {
    label: "Overview",
    items: [
      { feature: "View Dashboard", title: "Dashboard", url: "/pages/bussiness/dashboard", icon: LayoutDashboard },
      { feature: "View Notifications", title: "Notifications", url: "/pages/bussiness/notifications", icon: Bell },
    ],
  },
  {
    label: "Business",
    items: [
      { feature: "Manage Profile", title: "Business Profile", url: "/pages/bussiness/profile", icon: Building2 },
      { feature: "Manage Post", title: "Post", url: "/pages/bussiness/myPost", icon: FileText },
      { feature: "Manage Chat", title: "Chat", url: "/pages/bussiness/convos", icon: MessageCircle },
      { feature: "Manage Documents", title: "Documents", url: "/pages/bussiness/documents", icon: File },
    ],
  },
  {
    label: "People",
    items: [
      { feature: "Manage Artists", title: "Artists", url: "/pages/bussiness/artists", icon: Users },
      { feature: "Manage Employee", title: "Employee", url: "/pages/bussiness/employee", icon: Users2 },
      { feature: "Manage Role", title: "Role", url: "/pages/bussiness/role", icon: Shield },
    ],
  },
  {
    label: "Finance",
    items: [
    
      { feature: "Manage Financial", title: "Finance", url: "/pages/bussiness/finance", icon: DollarSignIcon },
      { feature: "Manage Payroll", title: "Payroll", url: "/pages/bussiness/payroll", icon: LucideCircleDollarSign },
      { feature: "View Transactions", title: "Transactions", url: "/pages/bussiness/transactions", icon: History },
    ],
  },
  {
    label: "Operations",
    items: [
      { feature: "Manage Payment", title: "Payments", url: "/pages/bussiness/clientPayment", icon: DollarSign },
      { feature: "Manage Bookings", title: "Bookings", url: "/pages/bussiness/bookings", icon: Calendar },
      { feature: "Manage Inventory", title: "Inventory", url: "/pages/bussiness/inventory", icon: Package },
      { feature: "Manage Subscription", title: "Subscription", url: "/pages/bussiness/subscription", icon: Crown },
    ],
  },
]

// Employee-only fixed links (always shown when type === "employee")
const EMPLOYEE_LINKS: NavItem[] = [
  { feature: "", title: "Home", url: "/pages/bussiness/home", icon: User },
  { feature: "", title: "My Attendance", url: "/pages/bussiness/myAttendance", icon: Calendar },
  { feature: "", title: "Payslip", url: "/pages/bussiness/payslip", icon: File },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getDays = (expiration: string) => {
  const today = new Date()
  const exp = new Date(expiration)
  return Math.max(0, Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
}

// ─── Collapsible Category ──────────────────────────────────────────────────────

interface CategoryGroupProps {
  label: string
  items: NavItem[]
  defaultOpen?: boolean
  onLinkClick?: () => void
}

function CategoryGroup({ label, items, defaultOpen = true, onLinkClick }: CategoryGroupProps) {
  const [open, setOpen] = useState(defaultOpen)
  const queryClient = useQueryClient()

  if (items.length === 0) return null

  return (
    <div className="mb-1">
      {/* Category header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 group transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <div className="h-px w-3 bg-gold opacity-40 group-hover:opacity-70 transition-opacity duration-200" />
          <span className="text-[10px] uppercase tracking-[0.26em] text-gold group-hover:text-gold transition-colors duration-200">
            {label}
          </span>
        </div>
        {open ? (
          <ChevronDown size={10} className="text-text-dim group-hover:text-gold transition-colors duration-200" />
        ) : (
          <ChevronRight size={10} className="text-text-dim group-hover:text-gold transition-colors duration-200" />
        )}
      </button>

      {/* Animated items */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${items.length * 56}px` : "0px" }}
      >
        <div className="space-y-0.5 pl-2 pr-1 pb-2">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              onClick={() => {
                onLinkClick?.()
                // Clear the sidebar's unread badge the instant Notifications is
                // clicked — the notifications page marks them seen server-side
                // on load; this makes the badge reflect that immediately.
                if (item.url.includes("/notifications")) queryClient.setQueryData(["unseen-notif"], [])
              }}
              className="group flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-text hover:bg-surface-alt border border-transparent hover:border-border-gold transition-all duration-300 rounded-sm"
            >
              <div className="bg-surface border border-border group-hover:border-border-gold p-1.5 transition-all duration-300 shrink-0">
                <item.icon size={12} className="text-gold" />
              </div>
              <span className="text-sm tracking-wide truncate">{item.title}</span> {item.title == "Notifications" && <NotificationsCount />} 
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface AppSidebarProps {
  className?: string
}

export function SidebarBussiness({ className }: AppSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useUserStore()

  const {lightMode, setLightMode} = useLightModeStore()

  // Apply class to <html>
  useEffect(() => {
    const root = document.documentElement
    if (lightMode) {
      root.classList.add("light")
      root.classList.remove("dark")
    } else {
      root.classList.remove("light")
    }
  }, [lightMode])

  const { data: employeeData } = useQuery({
    queryKey: ["employee_data"],
    queryFn: async (): Promise<employeeInterface> => {
      const response = await axiosInstance.get(`/account/employee/${user?.email}`)
      return response.data
    },
    enabled: user?.type === "employee",
  })

  // Filter each category's items based on permissions
  const filteredCategories = useMemo<NavCategory[]>(() => {
    return NAV_CATEGORIES.map((cat) => ({
      ...cat,
      items:
        user?.type !== "employee"
          ? cat.items
          : cat.items.filter((item) => employeeData?.permissions?.includes(item.feature)),
    })).filter((cat) => cat.items.length > 0)
  }, [user?.type, employeeData])

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const queryClient = useQueryClient()
  const router = useRouter()

  const logoutHandler = async () => {
    queryClient.clear()
    localStorage.clear()
    sessionStorage.clear()
    router.push("/")
  }

  const daysLeft = getDays(user?.subscriptionExpiration!)
  const subExpired = daysLeft === 0
  const subUrgent = daysLeft <= 3 && daysLeft > 0

  // ── Shared nav content (used in both mobile drawer & desktop sidebar) ─────────
  const NavContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <div className="flex-1 overflow-y-auto pt-4 pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      {/* Employee-only section */}
      {user?.type === "employee" && (
        <CategoryGroup
          label="My Space"
          items={EMPLOYEE_LINKS}
          defaultOpen={true}
          onLinkClick={onLinkClick}
        />
      )}

      {/* Permission-filtered categories */}
      {filteredCategories.map((cat, i) => (
        <CategoryGroup
          key={cat.label}
          label={cat.label}
          items={cat.items}
          defaultOpen={i === 0}
          onLinkClick={onLinkClick}
        />
      ))}
    </div>
  )

  

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

      {/* ── Mobile Navbar ── */}
      <div className="lg:hidden bg-primary text-text p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="aspect-square size-8 overflow-hidden border border-border">
            <img src="/web/logo.jpg" alt="Logo" className="object-cover w-full h-full" />
          </div>
          <div className="flex flex-col">
            <span
              className="text-gold text-sm font-light tracking-[0.14em] uppercase"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
               Ink Of Baphomet
            </span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-text-muted">
              {user?.type === "bussiness" ? "Business" : employeeData?.role}
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

      {/* ── Mobile Sidebar Drawer ── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-primary/80 backdrop-blur-sm" onClick={closeMobileMenu}>
          <div
            className="fixed top-0 left-0 w-64 h-full bg-secondary border-r border-border shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="pt-20 px-6 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-gold opacity-60" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Navigation</span>
              </div>
            </div>

            <NavContent onLinkClick={closeMobileMenu} />

            {/* Drawer footer */}
            <div className="px-4 py-4 border-t border-border">
              <div
                onClick={() => { closeMobileMenu(); logoutHandler() }}
                className="group flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-danger-light hover:bg-danger-muted border border-transparent hover:border-danger-border cursor-pointer transition-all duration-300"
              >
                <div className="bg-surface border border-border group-hover:border-danger-border p-1.5 transition-all duration-300">
                  <LogOut size={13} className="text-text-dim group-hover:text-danger-light" />
                </div>
                <span className="text-sm tracking-wide">Logout</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <Sidebar className={`hidden lg:flex bg-secondary border-r border-border ${className}`}>

        {/* Header */}
        <SidebarHeader className="bg-secondary border-b border-border px-6 py-5">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="flex items-center gap-4">
                  <div className="aspect-square size-8 overflow-hidden   transition-all duration-300">
                    <img src="/web/logo.jpg" alt="Logo" className="object-cover w-full h-full" />
                  </div>
                  <div className="grid flex-1 text-left leading-tight gap-1">
                    <span
                      className="truncate text-gold font-light tracking-[0.14em] uppercase text-sm"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {user?.type === "bussiness" ? "Business" : employeeData?.role}
                    </span>
                    <span
                      className={`inline-flex items-center font-bold gap-1 text-[8px] uppercase tracking-[0.18em]  ${
                        subExpired ? "text-danger-light" : subUrgent ? "text-warning-light" : "text-gold"
                      }`}
                    >
                      <Crown
                        className="w-3 h-3 "
                        color={
                          subExpired
                            ? "var(--color-danger-light)"
                            : subUrgent
                            ? "var(--color-warning-light)"
                            : "var(--color-gold)"
                        }
                      />
                      {subExpired ? "Expired" : `${daysLeft} days  left`}
                    </span>
                  </div>

                    <button
                      onClick={() => setLightMode(!lightMode)}
                      className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-alt hover:border-gold transition-colors duration-300"
                      aria-label="Toggle light/dark mode"
                    >
                      {lightMode
                        ? <Moon className="h-4 w-4 text-text-muted" />
                        : <Sun className="h-4 w-4 text-gold" />
                      }
                    </button>

                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="bg-secondary px-2">
          <NavContent />
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
                    <LogOut size={13} className="text-text-dim group-hover:text-danger-light" />
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
  )
}