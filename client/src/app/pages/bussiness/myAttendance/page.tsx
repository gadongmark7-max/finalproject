"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import useUserStore from "@/app/store/useUserStore";
import { employeeInterface } from "@/app/types/accounts.type";
import LoadingScreen from "@/components/ui/loadingScreen";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import useCurrentLocation from "@/app/hooks/locationHooks";
import { mapIcon } from "@/app/utils/customFunction";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import "leaflet/dist/leaflet.css";
import TimerText from "@/components/ui/timer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  LogIn,
  LogOut,
  MapPin,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Timer,
  Navigation,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { calculateDistance } from "@/app/utils/customFunction";
import { attendanceInterface } from "@/app/types/attendance.type";
import {
  getTodayAttendance,
  convertToAmPm,
  isDayAvailable,
  getTimeInStatus,
  getTimeOutStatus,
} from "@/app/utils/customFunction";
import OtAction from "@/components/ui/otAction";
import { LeaveModal } from "./components/leave";

const ATTENDANCE_RADIUS = 25000;

export default function Page() {
  const { user } = useUserStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(
    format(new Date(), "HH:mm"),
  );

  const { data: attendances, refetch } = useQuery({
    queryKey: ["employee_attendances"],
    queryFn: async (): Promise<attendanceInterface[]> => {
      const response = await axiosInstance.get(
        `/account/attendance/${user?.email}`,
      );
      return response.data;
    },
  });

  const { data: employeeData } = useQuery({
    queryKey: ["employee_data"],
    queryFn: async (): Promise<employeeInterface> => {
      const response = await axiosInstance.get(
        `/account/employee/${user?.email}`,
      );
      return response.data;
    },
    enabled: user?.type === "employee",
  });

  const { data: bussinessInfo } = useQuery({
    queryKey: ["info_bussiness"],
    queryFn: async (): Promise<bussinessInfoInterface> => {
      const response = await axiosInstance.get(
        `/account/bussinessInfo/${user?._id}`,
      );
      return response.data;
    },
  });

  const todayAttendance = getTodayAttendance(
    format(selectedDate, "yyyy-MM-dd"),
    attendances || [],
  );
  const currentLocation = useCurrentLocation();

  const isWithinRange = useMemo(() => {
    if (!currentLocation || !bussinessInfo?.bussiness?.location) return false;
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      bussinessInfo.bussiness.location.lat!,
      bussinessInfo.bussiness.location.long!,
    );
    return distance <= ATTENDANCE_RADIUS;
  }, [currentLocation, bussinessInfo]);

  const distanceToOffice = useMemo(() => {
    if (!currentLocation || !bussinessInfo?.bussiness?.location) return null;
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      bussinessInfo.bussiness.location.lat!,
      bussinessInfo.bussiness.location.long!,
    );
    return Math.round(distance);
  }, [currentLocation, bussinessInfo]);

  const mutationTimeIn = useMutation({
    mutationFn: (data: {
      email: string;
      timeIn: string;
      date: string;
      bussiness: string;
    }) => axiosInstance.post("/account/attendance/timeIn", data),
    onSuccess: () => {
      successAlert("time in recorded");
      refetch();
    },
    onError: () => errorAlert("error occur"),
  });

  const mutationTimeOut = useMutation({
    mutationFn: (data: {
      timeOut: string;
      attendanceId: string;
      employeeEmail: string;
    }) => axiosInstance.post("/account/attendance/timeOut", data),
    onSuccess: () => {
      successAlert("time out recoreded");
      refetch();
    },
    onError: () => errorAlert("error occur"),
  });

  const isValidTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(selectedTime);

  const handleTimeIn = async () => {
    if (!user || !bussinessInfo) return errorAlert("user not found");
    if (!isValidTime) return errorAlert("Please enter a valid time");
    confirmAlert("you want to tim in?", "time in", () => {
      mutationTimeIn.mutate({
        bussiness: bussinessInfo?.bussiness._id,
        email: user?.email,
        timeIn: selectedTime,
        date: format(selectedDate, "yyyy-MM-dd"),
      });
    });
  };

  const handleTimeOut = async () => {
    if (!todayAttendance) return errorAlert("user not found");
    if (!isValidTime) return errorAlert("Please enter a valid time");
    confirmAlert("you want to tim out?", "time out", () => {
      mutationTimeOut.mutate({
        timeOut: selectedTime,
        attendanceId: todayAttendance._id,
        employeeEmail: user?.email!,
      });
    });
  };

  if (!bussinessInfo || !currentLocation || !user || !employeeData)
    return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-primary">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient gold glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full opacity-[0.07] blur-[120px] bg-gold" />

      {/* Page Header */}
      <div className="bg-secondary border-b border-border px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                Studio Portal
              </span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              My Attendance
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Track your work hours and location-based attendance
            </p>
          </div>

          <div className="flex items-center gap-2 pb-1">
            {isWithinRange ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] bg-success-muted text-success-light border border-success-border">
                <CheckCircle2 className="w-3 h-3" /> In Range
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] bg-danger-muted text-danger-light border border-danger-border">
                <XCircle className="w-3 h-3" /> Out of Range
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Clock In/Out Card */}
            <div className="bg-surface border border-border relative group">
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
              <div className="p-6 border-b border-border flex items-center gap-3">
                <div className="bg-surface-alt border border-border p-2">
                  <Timer className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="h-px w-4 bg-gold opacity-50" />
                    <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                      Clock In / Out
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Record your attendance for today
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Dev mode picker */}
                <div className="border border-warning-border bg-warning-muted p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-warning-light mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-warning-light uppercase tracking-[0.1em]">
                        Development Mode
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Date picker for testing — will be removed later
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground",
                          )}
                          size="sm"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      aria-invalid={!isValidTime}
                      className="bg-surface border border-border text-text text-sm px-3 py-1.5 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 placeholder:text-text-dim aria-invalid:border-danger"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleTimeIn}
                    disabled={
                      !isWithinRange ||
                      mutationTimeIn.isPending ||
                      !!todayAttendance ||
                      isDayAvailable(selectedDate, employeeData.schedDay)
                    }
                    size="lg"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Time In</span>
                  </Button>

                  <Button
                    onClick={handleTimeOut}
                    disabled={
                      !isWithinRange ||
                      mutationTimeOut.isPending ||
                      !todayAttendance ||
                      isDayAvailable(selectedDate, employeeData.schedDay)
                    }
                    size="lg"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Time Out</span>
                  </Button>
                </div>

                {!isWithinRange && (
                  <div className="flex items-start gap-3 p-4 bg-danger-muted border border-danger-border">
                    <AlertCircle className="w-4 h-4 text-danger-light mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-text-muted leading-relaxed">
                      You must be within{" "}
                      <span className="text-danger-light font-medium">
                        {ATTENDANCE_RADIUS}m
                      </span>{" "}
                      of the office to clock in or out. Currently{" "}
                      <span className="text-danger-light font-medium">
                        {distanceToOffice}m
                      </span>{" "}
                      away.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-surface border border-border relative group overflow-hidden">
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
              <div className="p-6 border-b border-border flex items-center gap-3">
                <div className="bg-surface-alt border border-border p-2">
                  <MapPin className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="h-px w-4 bg-gold opacity-50" />
                    <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                      Location Tracking
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Your current location and office geofence boundary
                  </p>
                </div>
              </div>
              <div className="h-[400px] w-full">
                <MapContainer
                  center={[currentLocation?.lat, currentLocation?.lng]}
                  zoom={16}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[
                      bussinessInfo.bussiness?.location?.lat!,
                      bussinessInfo.bussiness?.location?.long!,
                    ]}
                    icon={mapIcon("/shop-logo.jpg")}
                  >
                    <Popup>
                      <div className="text-center">
                        <h3 className="font-semibold">Office Location</h3>
                        <p className="text-sm">
                          {bussinessInfo.bussiness?.name || "Business Location"}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[
                      bussinessInfo.bussiness?.location?.lat!,
                      bussinessInfo.bussiness?.location?.long!,
                    ]}
                    radius={ATTENDANCE_RADIUS}
                    pathOptions={{
                      color: isWithinRange ? "#4E7C59" : "#C9A84C",
                      fillColor: isWithinRange ? "#4E7C59" : "#C9A84C",
                      fillOpacity: 0.08,
                      weight: 2,
                      dashArray: "5, 5",
                    }}
                  />
                  <Marker
                    position={[currentLocation?.lat, currentLocation?.lng]}
                    icon={mapIcon(user?.profile)}
                  >
                    <Popup>
                      <div className="text-center">
                        <h3 className="font-semibold">Your Location</h3>
                        <p className="text-sm">
                          {isWithinRange
                            ? "Within attendance radius"
                            : "Outside attendance radius"}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Live Clock Card */}
            <div className="bg-surface border border-border relative group">
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-surface-alt border border-border p-2">
                    <Clock className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="h-px w-4 bg-gold opacity-50" />
                      <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                        Current Time
                      </span>
                    </div>
                  </div>
                </div>
                {isWithinRange ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-success-muted text-success-light border border-success-border">
                    <CheckCircle2 className="w-3 h-3" /> In Range
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] bg-danger-muted text-danger-light border border-danger-border">
                    <XCircle className="w-3 h-3" /> Out of Range
                  </span>
                )}
              </div>
              <div className="p-6 space-y-4">
                <TimerText />
                <div className="flex items-center gap-2 text-sm text-text-muted border-t border-border pt-4">
                  <Navigation className="w-4 h-4 text-gold" />
                  <span>
                    Distance to office:{" "}
                    <span className="text-text font-medium">
                      {distanceToOffice}m
                    </span>
                    {distanceToOffice && (
                      <span className="text-text-muted">
                        {" "}
                        ({isWithinRange ? "within" : "outside"}{" "}
                        {ATTENDANCE_RADIUS}m radius)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule Info */}
            {employeeData.schedTime.length !== 0 &&
            employeeData.schedDay.length !== 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Working Days */}
                <div className="bg-surface border border-border relative group p-5 space-y-3">
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
                  <div className="flex items-center gap-2">
                    <div className="bg-surface-alt border border-border p-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                      Working Days
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {employeeData.schedDay.map((item, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] bg-surface-alt border border-border text-text-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Shift Hours */}
                <div className="bg-surface border border-border relative group p-5 space-y-3">
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
                  <div className="flex items-center gap-2">
                    <div className="bg-surface-alt border border-border p-1.5">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                      Shift Hours
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-2xl font-light text-text"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {convertToAmPm(employeeData.schedTime[0])}
                    </span>
                    <div className="h-px w-4 bg-gold opacity-40" />
                    <span
                      className="text-2xl font-light text-text"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {convertToAmPm(
                        employeeData.schedTime[
                          employeeData.schedTime.length - 1
                        ],
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface border border-dashed border-border p-8 flex flex-col items-center justify-center text-center gap-3">
                <div className="bg-surface-alt border border-border p-3">
                  <CalendarIcon className="w-6 h-6 text-text-dim" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">
                    No schedule assigned yet
                  </p>
                  <p className="text-xs text-text-dim mt-1 tracking-wide">
                    Schedule will appear here once assigned
                  </p>
                </div>
              </div>
            )}

            {/* Attendance History */}
            <div className="bg-surface border border-border relative group">
              <div className="flex justify-between">
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-700" />
                <div className="p-6 border-b border-border flex items-center gap-3">
                  <div className="bg-surface-alt border border-border p-2">
                    <CalendarIcon className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="h-px w-4 bg-gold opacity-50" />
                      <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                        Attendance History
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">
                      Your recent attendance records and work hours
                    </p>
                  </div>
                </div>
                <LeaveModal
                  employeeEmail={employeeData.account.email}
                  businessId={bussinessInfo.bussiness._id}
                  times={employeeData.schedTime}
                  days={employeeData.schedDay}
                />
              </div>

              <div className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                          Date
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                          Time In
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                          Time Out
                        </span>
                      </TableHead>
                      <TableHead className="text-right">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                          Duration
                        </span>
                      </TableHead>
                      <TableHead className="text-right">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                          OT
                        </span>
                      </TableHead>
                      <TableHead className="text-right">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                          Action
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances?.map((record, index) => (
                      <TableRow
                        key={index}
                        className={`transition-colors ${todayAttendance && todayAttendance._id == record._id ? "bg-surface-alt" : ""}`}
                      >
                        <TableCell>
                          <span className="text-sm text-text font-light">
                            {format(new Date(record.date), "MMM dd, yyyy")}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-text">
                              {convertToAmPm(record.timeIn)}
                            </span>
                            {getTimeInStatus(
                              record.timeIn,
                              employeeData.schedTime[0],
                            ) === "ontime" ? (
                              <span className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-success-muted text-success-light border border-success-border">
                                On Time
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-danger-muted text-danger-light border border-danger-border">
                                Late
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {record.timeOut ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-text">
                                {convertToAmPm(record.timeOut)}
                              </span>
                              {getTimeOutStatus(
                                record.timeOut,
                                employeeData.schedTime[
                                  employeeData.schedTime.length - 1
                                ],
                              ) === "earlyout" ? (
                                <span className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-danger-muted text-danger-light border border-danger-border">
                                  Early
                                </span>
                              ) : (
                                <span className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-success-muted text-success-light border border-success-border">
                                  Complete
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-text-dim italic text-sm">
                              —
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          {record.duration > 0 ? (
                            <span
                              className="text-lg font-light text-text"
                              style={{
                                fontFamily: "'Cormorant Garamond', serif",
                              }}
                            >
                              {record.duration.toFixed(1)}
                              <span className="text-xs text-text-muted ml-1">
                                hrs
                              </span>
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-[0.15em] text-gold">
                              Active
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="text-sm text-text-muted">
                            {record?.ot.toFixed(1)}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <OtAction attendance={record} refetch={refetch} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Footer */}
              {attendances && attendances.length > 0 && (
                <div className="px-6 py-4 border-t border-border flex justify-between items-center">
                  <p className="text-[10px] uppercase tracking-widest text-text-dim">
                    {attendances.length} record
                    {attendances.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-px w-4 bg-border" />
                    <span className="text-[10px] uppercase tracking-widest text-text-dim">
                      Ink Of Baphomet Studio
                    </span>
                    <div className="h-px w-4 bg-border" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
