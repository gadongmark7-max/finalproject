"use client"
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert } from "@/app/utils/alert";
import useUserStore from "@/app/store/useUserStore";
import { attendanceInterface } from "@/app/types/attendance.type";
import { employeeInterface } from "@/app/types/accounts.type";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import LoadingScreen from "@/components/ui/loadingScreen";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { convertToAmPm, getTimeInStatus, getTimeOutStatus } from "@/app/utils/customFunction";
import { Calendar1Icon, Clock, CalendarDays, User, Building2 } from "lucide-react";
import { format } from "date-fns";

export default function Page() {
  const { user } = useUserStore();

  const { data: attendances, refetch } = useQuery({
    queryKey: ["employee_attendances"],
    queryFn: async (): Promise<attendanceInterface[]> => {
      const response = await axiosInstance.get(`/account/attendance/${user?.email}`);
      return response.data;
    },
  });

  const { data: employeeData } = useQuery({
    queryKey: ["employee_data"],
    queryFn: async (): Promise<employeeInterface> => {
      const response = await axiosInstance.get(`/account/employee/${user?.email}`);
      return response.data;
    },
    enabled: user?.type === "employee",
  });

  const { data: bussinessInfo } = useQuery({
    queryKey: ["info_bussiness"],
    queryFn: async (): Promise<bussinessInfoInterface> => {
      const response = await axiosInstance.get(`/account/bussinessInfo/${user?._id}`);
      return response.data;
    },
  });

  if (!bussinessInfo || !employeeData || !attendances || !user) return <LoadingScreen />;

  const profile = employeeData.account.profile;
  const name = employeeData.account.name;
  const email = employeeData.account.email;
  const contac = employeeData.account.contact;
  const bussinessProfile = bussinessInfo.bussiness.profile;
  const bussinessName = bussinessInfo.bussiness.name;

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
        <div className="border-b border-border pb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Employee Portal</span>
          </div>
          <h1
            className="text-4xl font-light text-text tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            My Dashboard
          </h1>
          <p className="text-sm text-text-muted leading-relaxed mt-2">
            Your profile, schedule, and attendance records
          </p>
        </div>

        {/* User & Business Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">

          {/* User Info */}
          <div className="group relative bg-surface p-6 space-y-5 hover:bg-surface-alt transition-all duration-500 overflow-hidden">
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">User Info</span>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={profile}
                alt="Profile"
                className="w-14 h-14 object-cover border border-border group-hover:border-gold transition-all duration-500"
                style={{ borderRadius: 0 }}
              />
              <div className="flex flex-col gap-1">
                <p
                  className="font-light text-text text-lg tracking-wide"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {name}
                </p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">{email}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-dim">{contac}</p>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="group relative bg-surface p-6 space-y-5 hover:bg-surface-alt transition-all duration-500 overflow-hidden">
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Business Info</span>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={bussinessProfile}
                alt="Business Profile"
                className="w-14 h-14 object-cover border border-border group-hover:border-gold transition-all duration-500"
                style={{ borderRadius: 0 }}
              />
              <div className="flex flex-col gap-1">
                <p
                  className="font-light text-text text-lg tracking-wide"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {bussinessName}
                </p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">Studio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        {(employeeData.schedTime.length !== 0 && employeeData.schedDay.length !== 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">

            {/* Working Days */}
            <div className="bg-secondary p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Working Days</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {employeeData.schedDay.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 border border-border bg-surface-alt text-[10px] uppercase tracking-[0.18em] text-text-muted hover:border-border-gold hover:text-gold transition-all duration-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Shift Hours */}
            <div className="bg-secondary p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gold" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Shift Hours</span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="text-3xl font-light text-text"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {convertToAmPm(employeeData.schedTime[0])}
                </span>
                <div className="h-px w-8 bg-gold opacity-40" />
                <span
                  className="text-3xl font-light text-text"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {convertToAmPm(employeeData.schedTime[employeeData.schedTime.length - 1])}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative bg-secondary border border-dashed border-border p-10 flex flex-col items-center justify-center text-center">
            <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-gold opacity-40" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-gold opacity-40" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b border-l border-gold opacity-40" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-gold opacity-40" />
            <CalendarDays className="w-8 h-8 text-text-dim mb-4" />
            <p
              className="text-xl font-light text-text-muted"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              No Schedule Assigned
            </p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-text-dim mt-2">
              Schedule will appear here once assigned
            </p>
          </div>
        )}

        {/* Attendance History */}
        <div className="bg-secondary border border-border">

          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <Calendar1Icon className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Attendance History</span>
          </div>

          <div className="px-2 pb-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Date</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Time In</span>
                  </TableHead>
                  <TableHead>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Time Out</span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Duration</span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">OT</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {attendances?.map((record, index) => {
                  const timeInStatus = getTimeInStatus(record.timeIn, employeeData.schedTime[0]);
                  const timeOutStatus = record.timeOut
                    ? getTimeOutStatus(record.timeOut, employeeData.schedTime[employeeData.schedTime.length - 1])
                    : null;

                  return (
                    <TableRow
                      key={index}
                      className="group border-border hover:bg-surface transition-all duration-300"
                    >
                      <TableCell>
                        <span className="text-sm font-light text-text">
                          {format(new Date(record.date), "MMM dd, yyyy")}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-light text-text-muted font-mono">
                            {convertToAmPm(record.timeIn)}
                          </span>
                          <span
                            className={`text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 border ${
                              timeInStatus === "ontime"
                                ? "bg-success-muted text-success-light border-success-border"
                                : "bg-danger-muted text-danger-light border-danger-border"
                            }`}
                          >
                            {timeInStatus}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {record.timeOut ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-light text-text-muted font-mono">
                              {convertToAmPm(record.timeOut)}
                            </span>
                            <span
                              className={`text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 border ${
                                timeOutStatus === "earlyout"
                                  ? "bg-danger-muted text-danger-light border-danger-border"
                                  : "bg-success-muted text-success-light border-success-border"
                              }`}
                            >
                              {timeOutStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-dim text-sm italic">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {record.duration > 0 ? (
                          <span
                            className="text-sm font-light text-gold"
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                          >
                            {record.duration.toFixed(1)} hrs
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-[0.16em] text-warning-light border border-warning-border bg-warning-muted px-2 py-0.5">
                            Active
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="text-sm font-light text-text-muted">
                          {record?.ot.toFixed(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-text-dim">
              {attendances?.length ?? 0} attendance {(attendances?.length ?? 0) !== 1 ? "records" : "record"} found
            </p>
            <div className="h-px w-24 bg-border" />
          </div>
        </div>

      </div>
    </div>
  );
}