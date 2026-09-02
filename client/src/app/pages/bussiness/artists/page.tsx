"use client";
import { Label } from "@/components/ui/label";
import { ArtistsApplication } from "./components/artistsApplication";
import useUserStore from "@/app/store/useUserStore";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { User, Mail, Phone, Loader2 } from "lucide-react"
import { EditSchedule } from "./components/editSchedule";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LookingForArtist } from "./components/lookingForArtist";
import { EmployeeInfo } from "./components/employeeInfo";

export default function Page() {
  const {user} = useUserStore()

  const [bussinessInfo, setBussinessInfo] = useState<bussinessInfoInterface | null>(null)

  const { data : bussinessInfoData, refetch } = useQuery({
    queryKey : ['bussiness_profile'],
    queryFn : () => axiosInstance.get(`/account/bussinessInfo/${user?._id}`),
  })

  useEffect(() => {
    if(bussinessInfoData?.data) setBussinessInfo(bussinessInfoData?.data)
  }, [bussinessInfoData])

  if(!bussinessInfo) return (
    <div className="w-full min-h-screen bg-primary flex items-center justify-center">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.28em] text-text-muted">Loading Artists</p>
      </div>
    </div>
  )

  return (
    <div className="w-full min-h-screen bg-primary">

      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-10">

        {/* Header */}
        <div className="w-full flex justify-between items-end border-b border-border pb-8">
          <div className="flex flex-col gap-3">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio Roster</span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Artists
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Manage your studio's talent, schedules, and compensation
            </p>
          </div>

          <div className="flex gap-5">
            <LookingForArtist businessInfo={bussinessInfo} />
            <ArtistsApplication key={user?._id} userId={user?._id!} setBussinessInfo={setBussinessInfo} />
          </div>
         
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-px bg-border">
          {[
            { label: "Total Artists", value: bussinessInfo.artists.length, icon: User },
            { label: "Active Schedules", value: bussinessInfo.artists.filter(a => a.schedDay?.length > 0).length, icon: Phone },
            { label: "Studio Members", value: bussinessInfo.artists.length, icon: Mail },
          ].map((stat, i) => (
            <div key={i} className="bg-secondary px-8 py-6 flex items-center gap-4">
              <div className="bg-surface-alt border border-border p-3">
                <stat.icon className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-light text-text" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="bg-secondary border border-border">
          {/* Table Header Label */}
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Artist Directory</span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                    <User className="w-3 h-3 text-gold" /> Artist
                  </span>
                </TableHead>
                <TableHead>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gold" /> Email
                  </span>
                </TableHead>
                <TableHead>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Salary</span>
                </TableHead>
                <TableHead>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Type</span>
                </TableHead>
                <TableHead>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gold" /> Contact
                  </span>
                </TableHead>
                  <TableHead className="text-right">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Info</span>
                </TableHead>
                <TableHead className="text-right">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Schedule</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {bussinessInfo.artists.map((item, index) => (
                <TableRow
                  key={item.artist._id}
                  className="group border-border hover:bg-surface transition-all duration-300 relative"
                >
                  {/* Artist Info */}
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={item.artist.profile}
                          alt="artist"
                          className="w-10 h-10 object-cover border border-border group-hover:border-gold transition-all duration-500"
                          style={{ borderRadius: 0 }}
                        />
                        {/* Ghost number */}
                        <span
                          className="absolute -top-3 -left-3 text-xs font-light text-text-dim select-none"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-light text-text tracking-wide">{item.artist.name}</span>
                        <span className="text-[10px] uppercase tracking-[0.14em] text-text-dim">Artist</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <span className="text-sm text-text-muted">{item.artist.email}</span>
                  </TableCell>

                  {/* Salary */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm text-gold font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        ₱{item.salary.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>

                  {/* Salary Type */}
                  <TableCell>
                    <div className="inline-flex items-center px-2 py-0.5 border border-border bg-surface-alt">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">per {item.salaryType}</span>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <span className="text-sm text-text-muted">{item.artist.contact}</span>
                  </TableCell>

                   <TableCell className="text-right w-[50px]">
                      <EmployeeInfo
                        refetch={refetch}
                        businessId={bussinessInfo._id}
                        employeeId={item.artist._id}
                        info={item.info}

                      />
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right">
                    <EditSchedule
                      currentCommision={item.commision}
                      currentDays={item.schedDay}
                      CurrentTime={item.schedTime}
                      hrs={item.schedTime.length}
                      artist={item.artist}
                      currentSalary={item.salary}
                      currentSalaryType={item.salaryType}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-text-dim">
              {bussinessInfo.artists.length} artist{bussinessInfo.artists.length !== 1 ? 's' : ''} registered
            </p>
            <div className="h-px w-24 bg-border" />
          </div>
        </div>

      </div>
    </div>
  );
}