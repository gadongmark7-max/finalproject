"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, LoaderCircle, RotateCcw, Check } from "lucide-react"

import axiosInstance from "@/app/utils/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface PickerClient {
  _id: string
  name: string
  email: string
  profile: string
  type: string
}

interface PaginatedClients {
  data: PickerClient[]
  total: number
  page: number
  totalPages: number
  limit: number
}

const LIMIT = 10

/**
 {@link LIMIT} 
 */
export function ClientPicker({
  endpoint,
  value,
  onSelect,
  disabled = false,
  noRecordsLabel = "No records found.",
}: {
  endpoint: string
  value: string
  onSelect: (id: string, client: PickerClient) => void
  disabled?: boolean
  noRecordsLabel?: string
}) {
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [page, setPage] = useState(1)
  const [picked, setPicked] = useState<PickerClient | null>(null)

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  // A new search always starts from the first page.
  useEffect(() => {
    setPage(1)
  }, [debounced])

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["client-picker", endpoint, page, debounced],
    queryFn: async (): Promise<PaginatedClients> => {
      const res = await axiosInstance.get(endpoint, {
        params: { page, limit: LIMIT, search: debounced },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
    enabled: !disabled,
  })

  const clients = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPage = data?.page ?? page

  return (
    <div className="w-full space-y-3">
      {/* Selected chip */}
      {picked && picked._id === value && (
        <div className="flex items-center gap-2 text-[11px] text-gold border border-border-gold bg-surface-alt px-3 py-2">
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Selected — {picked.name}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          value={search}
          disabled={disabled}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients by name or email…"
          className="pl-9"
        />
      </div>

      {/* Results */}
      <div className="relative border border-border divide-y divide-border max-h-[280px] overflow-y-auto">
        {isFetching && !isLoading && (
          <div className="absolute right-2 top-2 z-10">
            <LoaderCircle className="w-3.5 h-3.5 text-gold animate-spin" />
          </div>
        )}

        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-surface-alt animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-1/3 bg-surface-alt animate-pulse" />
                <div className="h-2 w-1/2 bg-surface-alt animate-pulse" />
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <p className="text-[11px] text-danger-light tracking-wide">
              Couldn&apos;t load clients.
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </Button>
          </div>
        ) : clients.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[11px] text-text-muted tracking-wide">
              {debounced ? "No users found matching your search." : noRecordsLabel}
            </p>
          </div>
        ) : (
          clients.map((c) => {
            const selected = c._id === value
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => {
                  setPicked(c)
                  onSelect(c._id, c)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  selected ? "bg-surface-alt" : "hover:bg-surface-alt/60"
                }`}
              >
                <img
                  src={c.profile}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text truncate">{c.name}</p>
                  <p className="text-[11px] text-text-muted truncate">{c.email}</p>
                </div>
                {selected && <Check className="w-4 h-4 text-gold shrink-0" />}
              </button>
            )
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
          {total === 0
            ? "0 results"
            : `Showing ${clients.length} · Page ${currentPage} of ${totalPages}`}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={disabled || currentPage <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled || currentPage >= totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
