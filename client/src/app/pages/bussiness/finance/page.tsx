"use client"

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import { expencesInterface } from "@/app/types/expences.type";
import useUserStore from "@/app/store/useUserStore";
import { transactionInterface } from "@/app/types/transaction.type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddExpencess } from "./components/addExpencess";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { payRollInterface } from "@/app/types/payroll.type";
import { ViewPayroll } from "./components/viewPayroll";
import SubscriptionExpired from "@/components/ui/subscriptionExpired";
import { checkIfSubsExpired } from "@/app/utils/customFunction";
import { ProofModal } from "./components/proofOfAcceptanceModal";
import { TrendingUp, Receipt, Clock, History, Loader2 } from "lucide-react";

interface dataInterface {
  expencess: expencesInterface[];
  transactions: transactionInterface[];
  bussinessInfo: bussinessInfoInterface;
}

export default function Page() {
  const { user } = useUserStore();

  const [bussinessInfo, setBussinessInfo] = useState<bussinessInfoInterface | null>(null);
  const [expencess, setExpencess] = useState<expencesInterface[]>([]);
  const [transactions, setTransactions] = useState<transactionInterface[]>([]);

  const [month, setMonth] = useState(() => {
    const currentMonth = new Date().getMonth() + 1;
    return currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
  });

  const { data, refetch } = useQuery({
    queryKey: ["bussiness_expencess"],
    queryFn: () => axiosInstance.get(`/account/expencess/${user?._id}`),
  });

  const { data: payrolls, refetch: refetchPayroll } = useQuery({
    queryKey: ["payroll_data"],
    queryFn: async (): Promise<payRollInterface[]> => {
      const response = await axiosInstance.get(`/account/payroll/${user?._id}`);
      return response.data;
    },
  });

  useEffect(() => {
    if (data?.data) {
      const responseData: dataInterface = data.data;
      const filteredExp = responseData.expencess.filter((item) => {
        const itemMonth = new Date(item.date).getMonth() + 1;
        return itemMonth === Number(month);
      });
      const filteredTrans = responseData.transactions.filter((item) => {
        const itemMonth = new Date(item.date).getMonth() + 1;
        return itemMonth === Number(month);
      });
      setExpencess(filteredExp);
      setTransactions(filteredTrans);
      setBussinessInfo(responseData.bussinessInfo);
    }
  }, [data, month]);

  const refetchAll = () => {
    refetch();
    refetchPayroll();
  };

  if (!data?.data) {
    return (
      <div className="w-full min-h-screen bg-primary flex items-center justify-center">
        <div
          className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
        />
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.28em] text-text-muted">Loading Financial Data</p>
        </div>
      </div>
    );
  }

  const getGross = () => {
    let gross = 0;
    transactions.forEach((t) => { gross += t.amount; });
    return gross;
  };

  const getTax = () => getGross() * 0.12;

  const getExpencess = () => {
    let amount = 0;
    expencess.forEach((item) => { amount += item.cost; });
    return amount;
  };

  const getNet = () => getGross() - getExpencess() - getTax();

  if (checkIfSubsExpired(user?.subscriptionExpiration!)) return <SubscriptionExpired />;

  const months = [
    { value: "01", label: "January" }, { value: "02", label: "February" },
    { value: "03", label: "March" }, { value: "04", label: "April" },
    { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" },
    { value: "09", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
  ];

  const summaryCards = [
    { label: "Profit", value: getNet() },
    { label: "Revenue", value: getGross() },
    { label: "Expenses", value: getExpencess() },
    { label: "Tax", value: getTax() },
  ];

  const statusStyle = (status: string) => {
    if (status === "pending") return "text-warning-light border-warning-border bg-warning-muted";
    if (status === "approved") return "text-success-light border-success-border bg-success-muted";
    if (status === "rejected") return "text-danger-light border-danger-border bg-danger-muted";
    return "";
  };

  return (
    <div className="w-full min-h-dvh bg-primary">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-10">

        {/* Page Header */}
        <div className="w-full flex items-end justify-between border-b border-border pb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio Finances</span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Financial Overview
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Track revenue, expenses, and payroll for your studio
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Filter by Month</span>
            <Select value={month} onValueChange={(value: string) => setMonth(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <TrendingUp className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Financial Summary</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {summaryCards.map((item) => (
              <div
                key={item.label}
                className="group relative bg-surface border-0 p-6 space-y-3 hover:bg-surface-alt transition-all duration-500 overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
                <div className="flex items-center gap-2">
                  <div className="h-px w-4 bg-gold opacity-60" />
                  <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{item.label}</p>
                </div>
                <p
                  className="text-3xl font-light text-text tracking-[-0.02em]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  <span className="text-gold text-xl mr-1">₱</span>
                  {item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses + Pending Payroll */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border">

          {/* Expenses Table */}
          <div className="bg-secondary border-0 flex flex-col max-h-[500px]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Expenses</span>
                </div>
                <p className="text-[11px] text-text-muted uppercase tracking-[0.14em]">
                  {months.find(m => m.value === month)?.label} records
                </p>
              </div>
              <AddExpencess refetch={refetch} />
            </div>

            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Description</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Cost</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Recorded By</span>
                    </TableHead>
                    <TableHead>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Date</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expencess.map((item) => (
                    <TableRow key={item._id} className="group border-border hover:bg-surface transition-all duration-300">
                      <TableCell>
                        <span className="text-sm font-light text-text">{item.description}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gold font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          ₱ {item.cost.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-text-muted">{item.recordedBy}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-text-muted">{item.date}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pending Payroll */}
          <div className="bg-secondary border-0 flex flex-col max-h-[500px]">
            <div className="px-6 py-4 border-b border-border flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Pending Payroll</span>
              </div>
              <p className="text-[11px] text-text-muted uppercase tracking-[0.14em]">
                Awaiting approval
              </p>
            </div>

            <div className="divide-y divide-border overflow-auto flex-1">
              {payrolls?.filter((item) => item.status === "pending").map((item) => (
                <div
                  key={item._id}
                  className="group flex items-center justify-between px-6 py-4 hover:bg-surface transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-light text-text">
                        {item.payroll[0].payType === "month"
                          ? item.payroll[0].month
                          : `${item.payroll[0].periodFrom} to ${item.payroll[0].periodTo}`}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-text-dim mt-0.5">
                        {item.payroll.length} Employees
                      </p>
                    </div>
                    <span className={`text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 border ${statusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <ViewPayroll payroll={item} refetch={refetchAll} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payroll History */}
        <div className="bg-secondary border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <History className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Payroll History</span>
          </div>

          <div className="divide-y divide-border overflow-auto">
            {payrolls
              ?.filter((item) => item.status === "approved" || item.status === "rejected")
              .map((item) => (
                <div
                  key={item._id}
                  className="group flex items-center justify-between px-6 py-4 hover:bg-surface transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-light text-text">
                        {item.payroll[0].payType === "month"
                          ? item.payroll[0].month
                          : `${item.payroll[0].periodFrom} to ${item.payroll[0].periodTo}`}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-text-dim mt-0.5">
                        {item.payroll.length} Employees
                      </p>
                    </div>
                    <span className={`text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 border ${statusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {item.payroll.filter((p) => !p.proofOfAcceptance).length !== 0 && (
                      <ProofModal payroll={item} refetch={refetchAll} />
                    )}
                    <ViewPayroll payroll={item} refetch={refetchAll} />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <p className="text-[10px] uppercase tracking-widest text-text-dim">
            {months.find(m => m.value === month)?.label} · Financial Report
          </p>
          <div className="h-px w-24 bg-border" />
        </div>

      </div>
    </div>
  );
}