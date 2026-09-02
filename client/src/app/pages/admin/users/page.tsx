"use client"
import { useState, useMemo } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import axiosInstance from "@/app/utils/axios"
import { confirmAlert, errorAlert, successAlert } from "@/app/utils/alert"
import { accountInterface } from "@/app/types/accounts.type"
import { Search, SlidersHorizontal, Users, ShieldOff, ShieldCheck } from "lucide-react"

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"

const typeStyles: Record<string, string> = {
  client:    "bg-info-muted    text-info-light    border border-info-border",
  bussiness: "bg-warning-muted text-warning-light border border-warning-border",
  artist:    "border text-[#A855F7] border-[#A855F740]",
  employee:  "border text-[#F97316] border-[#F9731640]",
}

const defaultTypeStyle = "bg-surface text-text-muted border border-border"

export default function Page() {

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const limit = 5

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["accounts_all"],
    queryFn: async (): Promise<accountInterface[]> => {
      const res = await axiosInstance.get(`/account/allUsers`)
      return res.data
    },
  })

  const mutation = useMutation({
    mutationFn: (id: string) => axiosInstance.put(`/account/admin/ban/${id}`),
    onSuccess: () => {
      successAlert("Success")
      refetch()
    },
    onError: () => errorAlert("Error occurred"),
  })

  const handleBan = (id: string, isBan: boolean) => {
    const title = isBan ? "Unban this user?" : "Ban this user?"
    const btnText = isBan ? "Unban" : "Ban"

    confirmAlert(title, btnText, () => {
      mutation.mutate(id)
    })
  }

  const filteredUsers = useMemo(() => {
    return users?.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())

      const matchType =
        typeFilter === "all" ? true : u.type === typeFilter

      return matchSearch && matchType
    }) || []
  }, [users, search, typeFilter])

  const totalPages = Math.ceil(filteredUsers.length / limit)
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * limit,
    page * limit
  )

  if (isLoading) return (
    <div className="w-full min-h-dvh bg-primary flex items-center justify-center">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[0.28em] text-gold mb-3">Loading</div>
        <p className="font-light text-text-muted" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Fetching user records…</p>
      </div>
    </div>
  )

  return (
    <div className="w-full min-h-dvh bg-primary p-6 lg:p-10">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-6xl mx-auto">

        {/* ── Page Header ── */}
        <div className="mb-10 border-b border-border pb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Administration</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1
                className="text-4xl font-light text-text tracking-[-0.02em] leading-none"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                User Registry
              </h1>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">
                Manage platform accounts, review member standing, and enforce access policies.
              </p>
            </div>
            <div className="flex items-center gap-2 text-text-dim">
              <Users size={14} className="text-gold" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                {filteredUsers.length} record{filteredUsers.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main Panel ── */}
        <div className="bg-secondary border border-border">

          {/* ── Search + Filter Bar ── */}
          <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-border">

            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => {
                  setPage(1)
                  setSearch(e.target.value)
                }}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal size={13} className="text-text-dim shrink-0" />
              <Select
                value={typeFilter}
                onValueChange={(val) => {
                  setPage(1)
                  setTypeFilter(val)
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="bussiness">Business</SelectItem>
                  <SelectItem value="artist">Artist</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Table ── */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Name</span>
                </TableHead>
                <TableHead>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Email</span>
                </TableHead>
                <TableHead>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Type</span>
                </TableHead>
                <TableHead>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Contact</span>
                </TableHead>
                <TableHead>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Status</span>
                </TableHead>
                <TableHead className="text-right">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="py-16 text-center">
                      <Users size={28} className="text-text-dim mx-auto mb-4" />
                      <p
                        className="text-xl font-light text-text-muted tracking-[-0.02em]"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        No users found
                      </p>
                      <p className="text-xs text-text-dim mt-1 tracking-wide">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user._id} className="group border-border hover:bg-surface transition-colors duration-300">

                    <TableCell>
                      <span className="text-sm text-text font-light">{user.name}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-text-muted">{user.email}</span>
                    </TableCell>

                    <TableCell>
                    <span className={`text-[10px] uppercase tracking-[0.18em] border px-2 py-[3px] ${typeStyles[user.type] ?? defaultTypeStyle}`}>
                        {user.type}
                    </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-text-muted">{user.contact}</span>
                    </TableCell>

                    <TableCell>
                      {user.isBan ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] px-2 py-[3px] bg-danger-muted text-danger-light border border-danger-border">
                          <ShieldOff size={9} />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] px-2 py-[3px] bg-success-muted text-success-light border border-success-border">
                          <ShieldCheck size={9} />
                          Active
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {user.isBan ? (
                        <Button
                          size="sm"
                          disabled={mutation.isPending}
                          onClick={() => handleBan(user._id, user.isBan)}

                        >
                          Unban
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={mutation.isPending}
                          onClick={() => handleBan(user._id, user.isBan)}
                        
                        >
                          Ban
                        </Button>
                      )}
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="h-px w-4 bg-gold opacity-40" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                Page {page} of {totalPages || 1}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}