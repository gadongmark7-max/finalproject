"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { useState, useEffect, useMemo } from "react";
import { inventoryInterface } from "@/app/types/inventory.type";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddItemModal } from "./components/addItemModal";
import { UpdateItemModal } from "./components/updateItemModal";
import { EditPriceCell } from "./components/editPriceCell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddStocksModal } from "./components/addStocksModal";
import { InventoryLogs } from "./components/inventoryLogs";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Layers,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";

type StockFilter = "all" | "out" | "limited" | "safe";
type SortDir = "asc" | "desc" | null;

export default function Page() {
  const [inventory, setInventory] = useState<inventoryInterface[]>([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const { data } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => axiosInstance.get(`/inventory`),
  });

  useEffect(() => {
    if (data?.data) setInventory(data?.data);
  }, [data]);

  const outOfStock = inventory.filter((i) => i.stocks === 0).length;
  const limitedStock = inventory.filter((i) => i.stocks > 0 && i.stocks < i.safeStock).length;
  const safeStock = inventory.filter((i) => i.stocks >= i.safeStock).length;

  // ── Derived filtered + sorted list ─────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...inventory];

    // Search by name
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) => i.item.toLowerCase().includes(q));
    }

    // Stock status filter
    if (stockFilter === "out") list = list.filter((i) => i.stocks === 0);
    else if (stockFilter === "limited") list = list.filter((i) => i.stocks > 0 && i.stocks < i.safeStock);
    else if (stockFilter === "safe") list = list.filter((i) => i.stocks >= i.safeStock);

    // Sort by stocks
    if (sortDir === "asc") list.sort((a, b) => a.stocks - b.stocks);
    else if (sortDir === "desc") list.sort((a, b) => b.stocks - a.stocks);

    return list;
  }, [inventory, search, stockFilter, sortDir]);

  const cycleSort = () => {
    setSortDir((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null));
  };

  const clearFilters = () => {
    setSearch("");
    setStockFilter("all");
    setSortDir(null);
  };

  const hasActiveFilters = search.trim() || stockFilter !== "all" || sortDir !== null;

  const SortIcon = sortDir === "asc" ? ArrowUp : sortDir === "desc" ? ArrowDown : ArrowUpDown;

  const STOCK_FILTERS: { key: StockFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "out", label: "Out of Stock" },
    { key: "limited", label: "Limited" },
    { key: "safe", label: "Safe" },
  ];

  return (
    <div className="w-full min-h-dvh bg-primary space-y-0">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Header */}
      <div className="w-full border-b border-border bg-secondary px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio Management</span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Inventory
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Track and manage your studio's supplies, inks, and equipment.
            </p>
          </div>
          <div className="flex gap-3 items-center pt-2">
            <InventoryLogs />
            <AddItemModal setInventory={setInventory} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="bg-primary border-b border-border px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-px bg-border">

          <button
            onClick={() => setStockFilter((p) => (p === "out" ? "all" : "out"))}
            className={`px-6 py-5 flex items-center gap-4 transition-colors duration-200 text-left ${
              stockFilter === "out" ? "bg-danger-muted" : "bg-primary hover:bg-surface"
            }`}
          >
            <div className={`border p-2.5 transition-colors duration-200 ${stockFilter === "out" ? "bg-danger-muted border-danger-border" : "bg-surface-alt border-border"}`}>
              <XCircle className="w-4 h-4 text-danger-light" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-0.5">Out of Stock</p>
              <p className="text-2xl font-light text-text" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{outOfStock}</p>
            </div>
          </button>

          <button
            onClick={() => setStockFilter((p) => (p === "limited" ? "all" : "limited"))}
            className={`px-6 py-5 flex items-center gap-4 transition-colors duration-200 text-left ${
              stockFilter === "limited" ? "bg-warning-muted" : "bg-primary hover:bg-surface"
            }`}
          >
            <div className={`border p-2.5 transition-colors duration-200 ${stockFilter === "limited" ? "bg-warning-muted border-warning-border" : "bg-surface-alt border-border"}`}>
              <AlertTriangle className="w-4 h-4 text-warning-light" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-0.5">Limited Stock</p>
              <p className="text-2xl font-light text-text" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{limitedStock}</p>
            </div>
          </button>

          <button
            onClick={() => setStockFilter((p) => (p === "safe" ? "all" : "safe"))}
            className={`px-6 py-5 flex items-center gap-4 transition-colors duration-200 text-left ${
              stockFilter === "safe" ? "bg-success-muted" : "bg-primary hover:bg-surface"
            }`}
          >
            <div className={`border p-2.5 transition-colors duration-200 ${stockFilter === "safe" ? "bg-success-muted border-success-border" : "bg-surface-alt border-border"}`}>
              <CheckCircle className="w-4 h-4 text-success-light" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-0.5">Safe Stock</p>
              <p className="text-2xl font-light text-text" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{safeStock}</p>
            </div>
          </button>

        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-secondary border-b border-border px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border pl-9 pr-9 py-2 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-border-gold transition-colors duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stock status filter pills */}
          <div className="flex items-center gap-1.5">
            {STOCK_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStockFilter(f.key)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] border transition-all duration-200 ${
                  stockFilter === f.key
                    ? "bg-gold/10 border-border-gold text-gold"
                    : "bg-surface border-border text-text-muted hover:border-border-gold hover:text-text"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort by stocks */}
          <button
            onClick={cycleSort}
            className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] border transition-all duration-200 ${
              sortDir !== null
                ? "bg-gold/10 border-border-gold text-gold"
                : "bg-surface border-border text-text-muted hover:border-border-gold hover:text-text"
            }`}
          >
            <SortIcon className="w-3 h-3" />
            Stocks {sortDir === "asc" ? "↑ Low–High" : sortDir === "desc" ? "↓ High–Low" : ""}
          </button>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-text-dim hover:text-danger-light border border-transparent hover:border-danger-border transition-all duration-200"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}

        </div>
      </div>

      {/* Table section */}
      <div className="bg-secondary px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">

          <div className="border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Item</span>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={cycleSort}
                      className="flex items-center gap-1.5 group transition-colors duration-200 hover:text-gold"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted group-hover:text-gold transition-colors duration-200">Quantity</span>
                      <SortIcon className={`w-3 h-3 transition-colors duration-200 ${sortDir !== null ? "text-gold" : "text-text-dim group-hover:text-gold"}`} />
                    </button>
                  </TableHead>
                  <TableHead>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Type</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Unit Price</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Safe Stocks</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Status</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Category</span>
                  </TableHead>
                  <TableHead className="text-end">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Edit</span>
                  </TableHead>
                  <TableHead className="text-end">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Add Stocks</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {displayed.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="bg-surface-alt border border-border p-4">
                          <Package className="w-8 h-8 text-text-dim" />
                        </div>
                        <div className="text-center space-y-1">
                          {inventory.length === 0 ? (
                            <>
                              <p className="text-sm text-text-muted">No inventory items found</p>
                              <p className="text-xs text-text-dim tracking-wide">Add your first item to get started</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-text-muted">No items match your filters</p>
                              <button onClick={clearFilters} className="text-xs text-gold tracking-wide hover:underline">
                                Clear filters
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {displayed.map((item) => (
                  <TableRow key={item._id} className="group border-b border-border hover:bg-surface transition-colors duration-200">

                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="bg-surface-alt border border-border p-1.5">
                          <Layers className="w-3 h-3 text-gold" />
                        </div>
                        <span className="text-sm text-text font-light">{item.item}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className="text-xl font-light text-text"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {item.stocks.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                      </span>
                      <span className="ml-1.5 text-sm text-text-muted">{item.type}</span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-text-muted">{item.type}</span>
                    </TableCell>

                    <TableCell>
                      <EditPriceCell inventory={item} setInventory={setInventory} />
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-text-dim">{item.safeStock}</span>
                    </TableCell>

                    <TableCell>
                      {item.stocks === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-danger-muted text-danger-light border border-danger-border">
                          <XCircle className="w-3 h-3" />
                          Out of Stock
                        </span>
                      ) : item.stocks < item.safeStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-warning-muted text-warning-light border border-warning-border">
                          <AlertTriangle className="w-3 h-3" />
                          Limited
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-success-muted text-success-light border border-success-border">
                          <CheckCircle className="w-3 h-3" />
                          Safe
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted border border-border px-2 py-1">
                        {item.category}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <UpdateItemModal inventory={item} setInventory={setInventory} />
                    </TableCell>

                    <TableCell className="text-right w-[20px]">
                      <AddStocksModal inventory={item} setInventory={setInventory} />
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer label */}
          {inventory.length > 0 && (
            <div className="flex justify-between items-center mt-4 px-1">
              <p className="text-[10px] uppercase tracking-widest text-text-dim">
                {displayed.length !== inventory.length
                  ? `${displayed.length} of ${inventory.length} item${inventory.length !== 1 ? "s" : ""}`
                  : `${inventory.length} item${inventory.length !== 1 ? "s" : ""} total`}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="h-px w-4 bg-border" />
                <span className="text-[10px] uppercase tracking-widest text-text-dim">Ink Of Baphomet Studio</span>
                <div className="h-px w-4 bg-border" />
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}