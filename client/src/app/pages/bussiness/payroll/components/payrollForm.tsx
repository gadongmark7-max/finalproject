"use client"
import { attendanceInterface } from "@/app/types/attendance.type";
import { payrollEmployeeDataInterface } from "@/app/types/payroll.type";
import { useState } from "react";
import useUserStore from "@/app/store/useUserStore";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axios";
import { errorAlert, successAlert, confirmAlert } from "@/app/utils/alert";
import { payRollInterfaceInput } from "@/app/types/payroll.type";
import { Button } from "@/components/ui/button";
import { configInterface } from "@/app/types/accounts.type";
import { bookingInterface } from "@/app/types/booking.type";

function countScheduledDays(
    startDate: string,
    endDate: string,
    schedDays: string[]
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    // Map number -> weekday name
    const dayMap: Record<number, string> = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };
  
    // Initialize counts per day
    const counts: Record<string, number> = {};
    schedDays.forEach((day) => (counts[day] = 0));
  
    // Iterate over the date range
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
      const dayName = dayMap[d.getDay()];
      if (schedDays.includes(dayName)) {
        counts[dayName]++;
      }
    }
  
    // Total scheduled days
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
  
    return total;
  }
  
  function getMonthRangeYMD(monthName: string, year: number = new Date().getFullYear()) {
    const monthMap: Record<string, number> = {
      "January": 0,
      "February": 1,
      "March": 2,
      "April": 3,
      "May": 4,
      "June": 5,
      "July": 6,
      "August": 7,
      "September": 8,
      "October": 9,
      "November": 10,
      "December": 11,
    };
  
    const monthIndex = monthMap[monthName];
    if (monthIndex === undefined) throw new Error("Invalid month name");
  
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
  
    const format = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  
    return {
      firstDay: format(firstDay),
      lastDay: format(lastDay),
    };
  }
  

  

  const getEmployeAttendance = (id : string, attendance : attendanceInterface[]) => {
    return attendance.filter((item) => item.account._id == id)
  }

  const getTotalWorkHrs = (attendance : attendanceInterface[]) => {
    let hrs = 0
    attendance.forEach((item) => {
        hrs += item.duration
    })
    return hrs
  }
  
  const getTotalOt = (attendance : attendanceInterface[]) => {
    let hrs = 0
    attendance.forEach((item) => {
        hrs += item.ot
    })
    return hrs
  }

  const getArtistCommision = (artistId : string, commisionPercentage : number , booking : bookingInterface[]) => {
    let commision = 0
    booking.forEach((item) => {
      if(item.artist._id == artistId) commision += ((commisionPercentage / 100) * item.originalPrice)
    })
    return commision
  }


export default function PayrollForm({attendance, employeeData, salaryType, month, startDate, endDate, clear, isApprove, disableOvertime, booking} : { booking :  bookingInterface[],disableOvertime : boolean , clear :  () => void ,attendance : attendanceInterface[], employeeData : payrollEmployeeDataInterface[], salaryType : string, month : string, startDate : string, endDate  :string, isApprove : boolean}) {

    const {user} = useUserStore()

   
    const [payrollData, setPayrollData] = useState(employeeData.map((employee) => {

        let start = startDate
        let end = endDate

        if(salaryType == "month"){
            const {firstDay, lastDay} = getMonthRangeYMD(month)
            start = firstDay
            end =  lastDay
        }

        const shipDays = countScheduledDays(start, end, employee.schedDay)

        const employeeAttendance = getEmployeAttendance(employee._id, attendance)

        const workHrs = getTotalWorkHrs(employeeAttendance)

        const hrsNeeded =  employee.dailyShipDuration * shipDays

        const yourAttendance = `${employeeAttendance.length}/${shipDays}`

      
        const otHrs = getTotalOt(employeeAttendance.filter((item) => item.otStatus == "recorded"))

        let basicPay = 0
        let otPay = 0

 
        

        switch(salaryType){
            case "hr": 
                basicPay =  (workHrs > hrsNeeded) ? hrsNeeded * employee.salary  : workHrs *  employee.salary  ;   
                if(otHrs != 0) otPay = otHrs * employee.salary
            break;

            case "day": 
                basicPay = employeeAttendance.length * employee.salary;  
                if(otHrs != 0) otPay = (employee.salary / employee.dailyShipDuration) * otHrs
            break;

            case "month": 
                basicPay = employeeAttendance.length == shipDays ? employee.salary :  (employee.salary / shipDays) * employeeAttendance.length;  
                if(otHrs != 0){
                    const dailySalary = employee.salary / shipDays
                    const hrRate = dailySalary / employee.dailyShipDuration
                    otPay = hrRate * otHrs
                } 
            break;
        }

        if(disableOvertime) otPay = 0

        const commision = (employee.role == "artist") ? getArtistCommision(employee._id,  employee.comisionPercentage, booking) : 0
  

        const grossPay = basicPay + otPay + commision

        const totalDeducstions = 0

        const netPay = grossPay - totalDeducstions

       
        
        return {
            date : new Date().toISOString().split("T")[0],
            employeeId : employee._id,
            name : employee.name,
            role : employee.role,
            rate : employee.salary, 
            payType : salaryType,
            periodFrom :startDate,
            periodTo : endDate,
            month : month,
            hrsNeeded : hrsNeeded,
            workHrs : workHrs,
            otHrs : otHrs,
            basicPay : basicPay,
            otPay : otPay,
            commisions : commision,
            grossPay : grossPay,
            totalDeducstions : totalDeducstions,
            netPay : netPay,
            attendance : yourAttendance,
            proofOfAcceptance : null
        }
  }))


    const mutation = useMutation({
        mutationFn : (data : { payroll : payRollInterfaceInput, isApprove : boolean}) => axiosInstance.post("/account/payroll", data),
        onSuccess : (response) => {
            successAlert("Form Submited to Finance")
            clear()
        }, onError : () => errorAlert("error accour")
    })

    const handleSubmit = async () => {
    if(!user) return errorAlert("user not found")
    confirmAlert("you want to Submit this to finance?", "Submit", () => {
        mutation.mutate({
            payroll : {
                bussiness : user._id,
                payroll : payrollData,
                approvedDate : "",
                preparedBy : user.name,
                approveBy : "",
                status : "pending"
            },
            isApprove : isApprove
        })
    })
    };



  return (
    <div className="w-full bg-white p-10 text-black">
  
      {/* Company Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold tracking-wide">
          PAYROLL REGISTER
        </h1>

        <div className="flex justify-between">
            {salaryType === "month" ? (
            <p className="text-lg font-bold">Month: {month}</p>
            ) : (
            <p className="text-lg font-bold">
                Period Covered: {startDate} to {endDate}
            </p>
            )}

            <p className="text-lg font-bold">
                Payroll Type: per {salaryType}
            </p>
        </div>
        
      </div>
  
      {/* Payroll Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
  
          <thead>
            <tr>
              <th className="border border-black p-2">No.</th>
              <th className="border border-black p-2">Employee Name</th>
              <th className="border border-black p-2">Position</th>
              <th className="border border-black p-2">Attendance</th>
              <th className="border border-black p-2">Rate</th>
              <th className="border border-black p-2">Hrs Needed</th>
              <th className="border border-black p-2">Work Hrs</th>
              <th className="border border-black p-2">OT Hrs</th>
              <th className="border border-black p-2">Basic Pay</th>
              <th className="border border-black p-2">OT Pay</th>
              <th className="border border-black p-2">Commission</th>
              <th className="border border-black p-2">Gross Pay</th>
              <th className="border border-black p-2">Deductions</th>
              <th className="border border-black p-2">Net Pay</th>
             
            </tr>
          </thead>
  
          <tbody>
            {payrollData.map((employee, index) => (
              <tr key={employee.employeeId}>
                <td className="border border-black p-2 text-center">
                  {index + 1}
                </td>
  
                <td className="border border-black p-2">
                  {employee.name}
                </td>
  
                <td className="border border-black p-2">
                  {employee.role}
                </td>

                <td className="border border-black p-2">
                  {employee.attendance}
                </td>
  
                <td className="border border-black p-2 text-right">
                  ₱ {employee.rate}
                </td>

                <td className="border border-black p-2 text-center">
                  {employee.hrsNeeded}
                </td>
  
                <td className="border border-black p-2 text-center">
                  {employee.workHrs}
                </td>
  
                <td className="border border-black p-2 text-center">
                  {employee.otHrs.toFixed(1)}
                </td>
  
                <td className="border border-black p-2 text-right">
                  ₱ {employee.basicPay.toLocaleString()}
                </td>
  
                <td className="border border-black p-2 text-right">
                  ₱ {employee.otPay.toLocaleString()}
                </td>
  
                <td className="border border-black p-2 text-right">
                  ₱ {employee.commisions.toLocaleString()}
                </td>
  
                <td className="border border-black p-2 text-right">
                  ₱ {employee.grossPay.toLocaleString()}
                </td>
  
                <td className="border border-black p-2 text-right">
                  ₱ {employee.totalDeducstions.toLocaleString()}
                </td>
  
                <td className="border border-black p-2 text-right font-bold">
                  ₱ {employee.netPay.toLocaleString()}
                </td>
  
             
              </tr>
            ))}
          </tbody>
  
        </table>
      </div>
  
      {/* Footer Section */}
      <div className="mt-10 grid grid-cols-3 gap-10 text-sm">
  
        <div className="text-center">
            <p className="font-medium">
                {user?.name}
            </p>

            <div className="border-t border-black mt-6 pt-2">
                <p>Prepared By</p>
            </div>
        </div>

  
        <div className="text-center">
            <p className="font-medium">
                .
            </p>

            <div className="border-t border-black mt-6 pt-2">
                <p>  Approved By </p>
            </div>
        </div>
  
  
  
      </div>
    
      <div className="flex w-full mt-10 justify-end">
        <Button onClick={handleSubmit}> Submit To Finance</Button>
      </div>
 
  
    </div>
  )
  
}
