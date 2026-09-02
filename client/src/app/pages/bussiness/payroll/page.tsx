"use client"
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { successAlert, errorAlert, confirmAlert } from "@/app/utils/alert";
import { bussinessInfoInterface } from "@/app/types/accounts.type";
import useUserStore from "@/app/store/useUserStore";
import { attendanceInterface } from "@/app/types/attendance.type";
import LoadingScreen from "@/components/ui/loadingScreen";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { payrollEmployeeDataInterface } from "@/app/types/payroll.type";
import { accountInterface } from "@/app/types/accounts.type";
import PayrollForm from "./components/payrollForm";
import SubscriptionExpired from "@/components/ui/subscriptionExpired";
import { checkIfSubsExpired } from "@/app/utils/customFunction";
import { OtApprovalModal } from "./components/otApprovalModal";
import { bookingInterface } from "@/app/types/booking.type";
import { Users, FileText, CalendarRange } from "lucide-react";
import { LeaveApprovalModal } from "./components/leave";

const convertMDYtoYMD = (date: string) => {
  const [month, day, year] = date.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export default function Page() {
  const { user } = useUserStore();

  const { data: bussinessInfo } = useQuery({
    queryKey: ["bussiness_Info"],
    queryFn: async (): Promise<bussinessInfoInterface> => {
      const response = await axiosInstance.get(`/account/bussinessInfo/${user?._id}`);
      return response.data;
    },
  });

  const { data: attendances, refetch } = useQuery({
    queryKey: ["employee_attendances"],
    queryFn: async (): Promise<attendanceInterface[]> => {
      const response = await axiosInstance.get(`/account/attendance/`);
      return response.data;
    },
  });

  const { data: booking } = useQuery({
    queryKey: ["booking_completed"],
    queryFn: async (): Promise<bookingInterface[]> => {
      const response = await axiosInstance.get(`/booking/bussiness/completed/${user?._id}`);
      return response.data;
    },
  });

  const [selectedEmployees, setSelectedEmployees] = useState<accountInterface[]>([]);
  const [salaryType, setSalaryType] = useState<"hr" | "day" | "month">("hr");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<payrollEmployeeDataInterface[] | null>(null);
  const [attendanceByRange, setAttendanceByRange] = useState<attendanceInterface[] | null>(null);
  const [bookingByRange, setbookingByRange] = useState<bookingInterface[] | null>(null);

  useEffect(() => {
    setSelectedEmployees([]);
    setAttendanceByRange(null);
    setSelectedEmployeeData(null);
  }, [salaryType]);

  useEffect(() => {
    setAttendanceByRange(null);
    setSelectedEmployeeData(null);
  }, [startDate, endDate, selectedMonth]);

  const handleSelectEmployee = (employee: accountInterface) => {
    setSelectedEmployees((prev) =>
      prev.some((emp) => emp._id === employee._id)
        ? prev.filter((emp) => emp._id !== employee._id)
        : [...prev, employee]
    );
    setAttendanceByRange(null);
    setSelectedEmployeeData(null);
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length + filteredArtist.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees([
        ...filteredEmployees.map((emp) => emp.employee),
        ...filteredArtist.map((artist) => artist.artist),
      ]);
    }
    setAttendanceByRange(null);
    setSelectedEmployeeData(null);
  };

  const clear = () => {
    setAttendanceByRange(null);
    setSelectedEmployeeData(null);
    setSelectedEmployees([]);
  };

  const filteredEmployees = useMemo(() => {
    return bussinessInfo?.employees.filter((emp) => emp.employeeInfo.salaryType === salaryType) ?? [];
  }, [bussinessInfo, salaryType]);

  const filteredArtist = useMemo(() => {
    return bussinessInfo?.artists.filter((artist) => artist.salaryType === salaryType) ?? [];
  }, [bussinessInfo, salaryType]);

  if (!bussinessInfo || !attendances || !booking) return <LoadingScreen />;

  const getEmployeeInfo = (id: string, type: string) => {
    let salary = 0, dailyShipDuration = 0, role = "", comisionPercentage = 0, schedDay: string[] = [];
    if (type === "employee") {
      bussinessInfo?.employees.forEach((item) => {
        if (item.employee._id === id) {
          salary = item.employeeInfo.salary;
          dailyShipDuration = item.employeeInfo.schedTime.length - 1;
          role = item.employeeInfo.role;
          schedDay = item.employeeInfo.schedDay;
        }
      });
    } else {
      bussinessInfo?.artists.forEach((item) => {
        if (item.artist._id === id) {
          salary = item.salary;
          dailyShipDuration = item.schedTime.length - 1;
          role = item.artist.type;
          comisionPercentage = item.commision;
          schedDay = item.schedDay;
        }
      });
    }
    return { salary, dailyShipDuration, comisionPercentage, role, schedDay };
  };

  const generatePayRoll = () => {
    if ((salaryType === "hr" || salaryType === "day") && (!startDate || !endDate)) {
      return errorAlert("Empty date range");
    }
    if (salaryType === "month" && !selectedMonth) {
      return errorAlert("Empty month");
    }

    setAttendanceByRange(null);
    setSelectedEmployeeData(null);

    let filteredAttendance: attendanceInterface[] = [];
    let filteredBooking: bookingInterface[] = [];

    if (salaryType === "month") {
      filteredAttendance = attendances.filter((item) => {
        const monthName = new Date(item.date).toLocaleString("default", { month: "long" });
        return monthName === selectedMonth;
      });
      filteredBooking = booking.filter((item) => {
        const monthName = new Date(convertMDYtoYMD(item.date)).toLocaleString("default", { month: "long" });
        return monthName === selectedMonth;
      });
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredAttendance = attendances.filter((item) => {
        const d = new Date(item.date);
        return d >= start && d <= end;
      });
      filteredBooking = booking.filter((item) => {
        const d = new Date(convertMDYtoYMD(item.date));
        return d >= start && d <= end;
      });
    }

    setAttendanceByRange(filteredAttendance);
    setbookingByRange(filteredBooking);
    setSelectedEmployeeData(
      selectedEmployees.map((item) => {
        const { salary, dailyShipDuration, comisionPercentage, role, schedDay } = getEmployeeInfo(item._id, item.type);
        return { _id: item._id, name: item.name, schedDay, dailyShipDuration, comisionPercentage, role, salary };
      })
    );
  };

  if (checkIfSubsExpired(user?.subscriptionExpiration!)) return <SubscriptionExpired />;

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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

        {/* Header */}
        <div className="w-full flex items-end justify-between border-b border-border pb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Studio Operations</span>
            </div>
            <h1
              className="text-4xl font-light text-text tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Payroll Management
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Generate and manage staff payroll by date range or monthly period
            </p>
          </div>

          <div className="flex gap-3">
             <LeaveApprovalModal refetch={refetch}/>
             <OtApprovalModal refetch={refetch} attendance={attendances.filter((item) => item.otStatus == "pending")} />
          </div>
       
        </div>

        {/* Filters Row */}
        <div className="bg-secondary border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <CalendarRange className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Payroll Period</span>
          </div>

          <div className="flex flex-wrap gap-4 items-end">

            {(salaryType === "hr" || salaryType === "day") && (
              <div className="flex gap-4 items-end">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">From</span>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-48"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">To</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-48"
                  />
                </div>
              </div>
            )}

            {salaryType === "month" && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Month</span>
                <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-3 ml-auto">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Salary Type</span>
                <Select value={salaryType} onValueChange={(value: any) => setSalaryType(value)}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Salary Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">Per Hour</SelectItem>
                    <SelectItem value="day">Per Day</SelectItem>
                    <SelectItem value="month">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted opacity-0 select-none">Action</span>
                <Button onClick={generatePayRoll}>
                  Generate Payroll
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-secondary border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <Users className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Staff Selection</span>
            {selectedEmployees.length > 0 && (
              <span className="ml-auto text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 border border-border-gold bg-surface text-gold">
                {selectedEmployees.length} selected
              </span>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={
                      filteredEmployees.length > 0 &&
                      selectedEmployees.length === filteredEmployees.length + filteredArtist.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer accent-gold"
                  />
                </TableHead>
                <TableHead><span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Employee</span></TableHead>
                <TableHead><span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Email</span></TableHead>
                <TableHead><span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Contact</span></TableHead>
                <TableHead><span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Role</span></TableHead>
                <TableHead><span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Salary</span></TableHead>
                <TableHead><span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Type</span></TableHead>
                <TableHead><span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Commission</span></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredEmployees.map((employee, index) => (
                <TableRow
                  key={employee.employee._id}
                  className="group border-border hover:bg-surface transition-all duration-300 cursor-pointer"
                  onClick={() => handleSelectEmployee(employee.employee)}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.some((e) => e._id === employee.employee._id)}
                      onChange={() => handleSelectEmployee(employee.employee)}
                      className="w-4 h-4 cursor-pointer accent-gold"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={employee.employee.profile}
                          className="w-8 h-8 object-cover border border-border group-hover:border-gold transition-all duration-500"
                          style={{ borderRadius: 0 }}
                        />
                      </div>
                      <span className="text-sm font-light text-text">{employee.employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm text-text-muted">{employee.employee.email}</span></TableCell>
                  <TableCell><span className="text-sm text-text-muted">{employee.employee.contact}</span></TableCell>
                  <TableCell>
                    <div className="inline-flex items-center px-2 py-0.5 border border-border-gold bg-surface-alt">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-gold">{employee.employeeInfo.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-light text-gold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      ₱ {employee.employeeInfo.salary}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center px-2 py-0.5 border border-border bg-surface-alt">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">per {employee.employeeInfo.salaryType}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm text-text-muted">0%</span></TableCell>
                </TableRow>
              ))}

              {filteredArtist.map((item) => (
                <TableRow
                  key={item.artist._id}
                  className="group border-border hover:bg-surface transition-all duration-300 cursor-pointer"
                  onClick={() => handleSelectEmployee(item.artist)}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.some((e) => e._id === item.artist._id)}
                      onChange={() => handleSelectEmployee(item.artist)}
                      className="w-4 h-4 cursor-pointer accent-gold"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={item.artist.profile}
                        className="w-8 h-8 object-cover border border-border group-hover:border-gold transition-all duration-500"
                        style={{ borderRadius: 0 }}
                      />
                      <span className="text-sm font-light text-text">{item.artist.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm text-text-muted">{item.artist.email}</span></TableCell>
                  <TableCell><span className="text-sm text-text-muted">{item.artist.contact}</span></TableCell>
                  <TableCell>
                    <div className="inline-flex items-center px-2 py-0.5 border border-border-gold bg-surface-alt">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-gold">{item.artist.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-light text-gold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      ₱ {item.salary}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center px-2 py-0.5 border border-border bg-surface-alt">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">per {item.salaryType}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm text-text-muted">{item.commision}%</span></TableCell>
                </TableRow>
              ))}

              {filteredEmployees.length === 0 && filteredArtist.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-8 h-8 text-text-dim" />
                      <p className="text-[10px] uppercase tracking-[0.24em] text-text-dim">
                        No staff under this salary type
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-text-dim">
              {filteredEmployees.length + filteredArtist.length} staff · {selectedEmployees.length} selected
            </p>
            <div className="h-px w-24 bg-border" />
          </div>
        </div>

        {/* Payroll Form */}
        {selectedEmployeeData && attendanceByRange && bookingByRange && (
          <div className="border border-border bg-secondary">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <FileText className="w-3.5 h-3.5 text-gold" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Payroll Preview</span>
            </div>
            <div className="p-6">
              <PayrollForm
                key={selectedMonth + startDate + endDate}
                attendance={attendanceByRange}
                employeeData={selectedEmployeeData}
                salaryType={salaryType}
                month={selectedMonth}
                startDate={startDate}
                endDate={endDate}
                clear={clear}
                isApprove={!bussinessInfo.config.financeApproval}
                disableOvertime={!bussinessInfo.config.overTimePayment}
                booking={bookingByRange}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <p className="text-[10px] uppercase tracking-widest text-text-dim">
            Payroll · {salaryType === "month" ? selectedMonth || "Monthly" : `${startDate || "—"} to ${endDate || "—"}`}
          </p>
          <div className="h-px w-24 bg-border" />
        </div>

      </div>
    </div>
  );
}