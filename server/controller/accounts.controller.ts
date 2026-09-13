import { Response, response } from "express";
import { AuthRequest } from "../types/request.type";
import {
  accountInterface,
  accountInterfaceInput,
} from "../types/accounts.type";
import { AccountService } from "../services/acccount.service";
import { ArtistInfoService } from "../services/artistInfo.service";
import cloudinary from "../utils/cloudinary";
import { ArtistVerificationServices } from "../services/artistVerification.service";
import fs from "fs";
import { BookingService } from "../services/booking.service";
import { BussinessInfoService } from "../services/bussinessInfo.service";
import { ArtistApplicationService } from "../services/artistApplication.service";
import { TransactionService } from "../services/transaction.service";
import { NotificationService } from "../services/notifications.service";
import {
  getTime,
  getDate,
  getThisMonthSales,
  getYearlySales,
  sendEmail,
} from "../utils/customFunction";
import { EmployeeInfoService } from "../services/employeeInfo.service";
import { ExpencesService } from "../services/expences.service";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AttendanceService } from "../services/attendance.service";
import { PayrollService } from "../services/payroll.service";
import { DocumentService } from "../services/document.service";
import { LeaveService } from "../services/leave.service";
import bcrypt from "bcrypt";
import path from "path";
import dotenv from "dotenv";
import { AdminMessageService } from "../services/adminMessage.service";

dotenv.config();

export class AccountController {
  static getAllUsers = async (request: AuthRequest, response: Response) => {
    const users = await AccountService.getAll();
    const removeAdmin = users.filter((item) => item.type != "admin");
    response.send(removeAdmin);
  };

  static clientHome = async (request: AuthRequest, response: Response) => {
    response.send("sucdess");
  };

  static checkEmailExists = async (request: AuthRequest, response: Response) => {
    const email = ((request.query.email as string) || "").trim().toLowerCase();
    if (!email) {
      response.status(400).send("email required");
      return;
    }
    const account = await AccountService.checkEmailIfExist(email);
    response.send({ exists: !!account });
  };

  static getArtistInfo = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const artistInfo = await ArtistInfoService.getByArtist(id);
    response.send(artistInfo);
  };

  static getBussinessInfo = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const bussinessInfo = await BussinessInfoService.getByBussiness(id);
    response.send(bussinessInfo);
  };

  static getAdminAccount = async (request: AuthRequest, response: Response) => {
    const admin = await AccountService.getAdminAccount();
    response.send(admin);
  };

  static getAccount = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const account = await AccountService.get(id);
    response.send(account);
  };

  static forgotPasswordOtp = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { email } = request.body;
    const account = await AccountService.getByEmail(email);
    if (!account) {
      response.status(500).send("email not found");
      return;
    }
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    await AccountService.updatePinByEmail(email, pin);
    sendEmail(
      account.email!,
      "Forgot Password OTP",
      `Your reset code is ${pin}. This code is valid for a limited time.`,
    );
    response.send("success");
  };

  static verifyForgotPasswordOtp = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { email, otpInput } = request.body;
    const account = await AccountService.getByEmail(email);
    if (!account) {
      response.status(500).send("email not found");
      return;
    }
    if (otpInput == account.pin) {
      response.send("success");
    } else {
      response.status(500).send("invalid otp");
    }
  };

  static updateForgotPassword = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { email, newPassword } = request.body;
    const account = await AccountService.getByEmail(email);
    if (!account) {
      response.status(500).send("email not found");
      return;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await AccountService.updatePasswordByEmail(email, hashedPassword);
    await AccountService.updatePinByEmail(email, null);
    response.send("success");
  };

  static toggleIsBan = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    await AccountService.toggleIsBan(id);
    response.send("success");
  };

  static getEmployee = async (request: AuthRequest, response: Response) => {
    const { email } = request.params;
    const employeeInfo = await EmployeeInfoService.getByEmail(email);
    response.send(employeeInfo);
  };

  static getBussinessDashboard = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id, month } = request.params;

    const transaction = await TransactionService.getByReceiver(id);

    //@ts-ignore
    const monthSales = getThisMonthSales(month, transaction);

    //@ts-ignore
    const yearSales = getYearlySales(transaction);

    const pendingBookings = await BookingService.getByStatusAndStatusLenght(
      id,
      "pending",
    );
    const activeBookings = await BookingService.getByStatusAndStatusLenght(
      id,
      "active",
    );
    const activeAppointments = await BookingService.getByStatusAndStatusLenght(
      id,
      "appointment",
    );

    const bussinessInfo = await BussinessInfoService.getByBussiness(id);

    const expencess = await ExpencesService.getByAccount(id);
    const transactions = await TransactionService.getByReceiver(id);

    const filteredExp = expencess.filter((item) => {
      const itemMonth = new Date(item.date).getMonth() + 1;
      return itemMonth === Number(month);
    });

    // Filter transactions by month
    const filteredTrans = transactions.filter((item) => {
      const itemMonth = new Date(item.date).getMonth() + 1;
      return itemMonth === Number(month);
    });

    const getGross = () => {
      let gross = 0;
      filteredTrans.forEach((transaction) => {
        gross += transaction.amount;
      });
      return gross;
    };

    const getTax = () => {
      const gross = getGross();
      return gross * 0.12;
    };

    const getExpencess = () => {
      let amount = 0;
      filteredExp.forEach((item) => {
        amount += item.cost;
      });
      return amount;
    };

    const getNet = () => {
      const gross = getGross();
      const expencess = getExpencess();
      const tax = getTax();
      return gross - expencess - tax;
    };

    response.send({
      totalProfit: getNet(),
      totalRevenue: getGross(),
      totalExpenses: getExpencess(),
      totalTax: getTax(),
      employee:
        bussinessInfo?.employees.length! + bussinessInfo?.artists.length!,
      pendingBookings: pendingBookings,
      activeBookings: activeBookings,
      activeAppointments: activeAppointments,
      thisMonthSales: monthSales,
      yearlySales: yearSales,
    });
  };

  static startTrial = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const { days } = request.body;
    const account = await AccountService.addSubcriptionDays(id, days);
    response.send(account);
  };

  static EditEmployeeRole = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { role, permissions, employeeInfoId } = request.body;
    await EmployeeInfoService.updateRole(employeeInfoId, role, permissions);
    response.send("success");
  };

  static getClientsAccount = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const accounts = await AccountService.getByAccountType("client");
    response.send(accounts);
  };

  static getArtistApplicationByBussiness = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const applications = await ArtistApplicationService.getByBussiness(id);
    response.send(applications);
  };

  static getArtistBussiness = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const bussiness = await BussinessInfoService.getArtistBussiness(id);
    response.send(bussiness);
  };

  static getAllArtistInfo = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const artistInfo = await ArtistInfoService.getAll();
    response.send(artistInfo);
  };

  static getAllBussinessInfo = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const bussinessInfo = await BussinessInfoService.getAll();
    response.send(bussinessInfo);
  };

  static createBusinessLeave = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { date, type, businessId, times, days, employeeEmail } = request.body;
    const employee = await AccountService.getByEmail(employeeEmail);
    await LeaveService.create({
      account: employee?._id.toString()!,
      bussiness: businessId,
      isPaid: false,
      type: type,
      date: date,
      status: "pending",
      times: times,
      days: days,
    });
    response.send("sucess");
  };

  static getBusinessLeave = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const account = request.account;
    const leave = await LeaveService.getByBussiness(account?._id.toString()!);
    response.send(leave);
  };

  static leaveAction = async (request: AuthRequest, response: Response) => {
    const account = request.account;
    const { id, status, isPaid } = request.body;
    const fetchLeave = await LeaveService.get(id);
    const leave = fetchLeave!;
    const employee = await AccountService.get(leave?.account._id.toString()!);
    if (status == "recorded") {
      await AttendanceService.create({
        account: leave?.account._id.toString()!,
        bussiness: account?._id.toString()!,
        email: employee?.email!,
        accountType: account?.type!,
        date: leave.date,
        timeIn: leave.times[0],
        timeOut: leave.times[leave.times.length - 1],
        duration: leave.times.length - 1,
        ot: 0,
        otStatus: "request",
      });
      console.log("recoered");
      await NotificationService.create({
        account: leave?.account._id.toString()!,
        date: getDate(),
        time: getTime(),
        message: `Your ${leave?.type!} Request has been approve. status is ${isPaid ? "paid" : "unpaid"}`,
        type: "success",
        isSeen: false,
      });
      await LeaveService.updateIsPaid(id, isPaid);
    } else {
      await NotificationService.create({
        account: leave?.account._id.toString()!,
        date: getDate(),
        time: getTime(),
        message: `Your ${leave?.type!} Request has been Rejected`,
        type: "error",
        isSeen: false,
      });
    }
    await LeaveService.updateStatus(id, status);
    response.send("sucess");
  };

  static editConfig = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const { config } = request.body;
    const bussinessInfo = await BussinessInfoService.updateConfig(id, config);
    response.send(bussinessInfo);
  };

  static jobPost = async (request: AuthRequest, response: Response) => {
    const { id, isLookingArtist, jobDescription } = request.body;
    await BussinessInfoService.updateJobPost(
      id,
      isLookingArtist,
      jobDescription,
    );
    response.send("sucess");
  };

  static updateArtistLocation = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const { location, artistId } = request.body;
    const account = await AccountService.updateLocation(id, location);

    const accountInfo =
      account?.type == "artist"
        ? await ArtistInfoService.get(artistId)
        : await BussinessInfoService.get(artistId);

    response.send({ accountInfo, account });
  };

  static addExpencess = async (request: AuthRequest, response: Response) => {
    const { cost, description, recordedBy, date } = request.body;
    const account = request.account;
    await ExpencesService.create({
      account: account?._id!,
      date,
      description,
      cost,
      recordedBy,
    });
    response.send("success");
  };

  static getBussinessFinance = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const expencess = await ExpencesService.getByAccount(id);
    const transactions = await TransactionService.getByReceiver(id);
    const bussinessInfo = await BussinessInfoService.getByBussiness(id);
    response.send({
      expencess,
      transactions,
      bussinessInfo,
    });
  };

  static getAccountAttendance = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { email } = request.params;
    const attendances = await AttendanceService.getByEmail(email);
    response.send(attendances);
  };

  static getBussinessAttendance = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const account = request.account;
    const attendances = await AttendanceService.getByBussiness(account?._id!);
    response.send(attendances);
  };

  static timeInAttendance = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { email, timeIn, date, bussiness } = request.body;

    if (await AttendanceService.checkIfExist(email, date)) {
      response.status(500).send("already exist");
      return;
    }

    const account = await AccountService.getByEmail(email);
    await AttendanceService.create({
      account: account?._id.toString()!,
      bussiness: bussiness,
      email: account?.email!,
      accountType: account?.type!,
      date: date,
      timeIn: timeIn,
      timeOut: null,
      duration: 0,
      ot: 0,
      otStatus: "request",
    });
    response.send("success");
  };

  static timeOutAttendance = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { timeOut, attendanceId, bussinessId, employeeEmail } = request.body;
    const account = request.account;
    let employeeShipDuration = 0;
    if (account?.type == "artist") {
      const bussinessInfo =
        await BussinessInfoService.getByBussiness(bussinessId);
      bussinessInfo?.artists.forEach((item) => {
        if (item.artist._id.toString() == account._id)
          employeeShipDuration = item?.schedTime.length! - 1;
      });
    } else {
      const employeeData = await EmployeeInfoService.getByEmail(employeeEmail);
      employeeShipDuration = employeeData?.schedTime.length! - 1;
    }
    await AttendanceService.updateTimeOut(
      attendanceId,
      timeOut,
      employeeShipDuration,
    );
    response.send("success");
  };

  static handleOt = async (request: AuthRequest, response: Response) => {
    const { id, action } = request.body;

    await AttendanceService.updateStatus(id, action);

    response.send("success");
  };

  static getSenderTransactions = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const transactions = await TransactionService.getBySender(id);
    response.send(transactions);
  };

  static getReceiverTransactions = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const transactions = await TransactionService.getByReceiver(id);
    response.send(transactions);
  };

  static getTransactionReceipt = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const { id } = request.params;
      const transaction: any = await TransactionService.getByIdPopulated(id);
      if (!transaction) {
        response.status(404).send("Transaction not found");
        return;
      }

      const requesterId = request.account?._id;
      if (!requesterId || transaction.sender._id.toString() !== requesterId) {
        response
          .status(403)
          .send("You are not authorized to view this receipt");
        return;
      }

      response.send(transaction);
    } catch (e) {
      console.log(e);
      response.status(500).send("error accour");
    }
  };

  static getAccountNotifications = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const notifications = await NotificationService.getByAccount(id);
    await NotificationService.markAllAsSeen(id);
    response.send(notifications);
  };

  static getAccountNotificationUnseen = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const account = await request.account;
    const notifications = await NotificationService.getAllUnseen(account?._id!);
    response.send(notifications);
  };

  static getAdminMessage = async (request: AuthRequest, response: Response) => {
    const adminMesages = await AdminMessageService.getAll();
    await AdminMessageService.markAllAsSeen();
    response.send(adminMesages);
  };

  static getAdminMessageUnseen = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const adminMesages = await AdminMessageService.getAllUnseen();
    response.send(adminMesages);
  };

  static getDocuments = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const document = await DocumentService.getByAccount(id);
    response.send(document);
  };

  static artistApplicationApproval = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { artistId, action, applicationId } = request.body;
    const account = request.account;
    if (action == "approve") {
      await NotificationService.create({
        account: artistId,
        date: getDate(),
        time: getTime(),
        message: `Your Request has been approve. you are now Artist of ${account?.name}`,
        type: "success",
        isSeen: false,
      });
      await BussinessInfoService.pushArtist(account?._id!, artistId);
    } else {
      await NotificationService.create({
        account: artistId,
        date: getDate(),
        time: getTime(),
        message: `${account?.name} Reject your request.`,
        type: "danger",
        isSeen: false,
      });
    }
    await ArtistApplicationService.delete(applicationId);
    const bussinessInfo = await BussinessInfoService.getByBussiness(
      account?._id!,
    );
    response.send(bussinessInfo);
  };

  static addEmployee = async (request: AuthRequest, response: Response) => {
    const { accountData, role, permissions } = request.body;

    console.log("run this");

    if (await AccountService.checkEmailIfExist(accountData.email)) {
      response.status(500).send("email already exist");
      return;
    }
    const hashedPassword = await bcrypt.hash(accountData.password, 10);
    accountData.password = hashedPassword;

    const employee = await AccountService.create(accountData);

    const account = request.account;

    const employeeInfo = await EmployeeInfoService.create({
      bussiness: account?._id!,
      account: employee._id.toString(),
      permissions: permissions,
      email: employee.email,
      role: role,
      salary: 0,
      salaryType: "hr",
      schedTime: [],
      schedDay: [],
    });

    await BussinessInfoService.pushEmployee(
      account?._id!,
      employee._id.toString(),
      employeeInfo._id.toString(),
      accountData,
    );

    response.send("success");
  };

  static updateEmployeeInfo = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { type, info, employeeId, businessId } = request.body;
    switch (type) {
      case "employee":
        await BussinessInfoService.updateEmployeeInfo(
          businessId,
          employeeId,
          info,
        );
        break;

      case "artist":
        await BussinessInfoService.updateArtistInfo(
          businessId,
          employeeId,
          info,
        );
        console.log("art");
        break;
    }
    response.send("success");
  };

  static removeEmployee = async (request: AuthRequest, response: Response) => {
    const { type, employeeId, businessId } = request.body;
    switch (type) {
      case "employee":
        await BussinessInfoService.removeEmployeeFromBusiness(
          businessId,
          employeeId,
        );
        await AccountService.updateAccountType(employeeId, "client");
        await EmployeeInfoService.delete(employeeId, businessId);
        break;

      case "artist":
        await BussinessInfoService.removeArtistFromBusiness(
          businessId,
          employeeId,
        );
        break;
    }
    response.send("success");
  };

  static createPayroll = async (request: AuthRequest, response: Response) => {
    const { payroll, isApprove } = request.body;
    const account = request.account;
    const res = await PayrollService.create(payroll);
    if (isApprove) {
      const aprovedPayroll = await PayrollService.approve(
        res._id.toString()!,
        payroll.preparedBy,
      );
      for (const item of aprovedPayroll?.payroll!) {
        ExpencesService.create({
          date: getDate(),
          description: `Salary payment to ${item.name} `,
          account: account?._id!,
          cost: item.netPay,
          recordedBy: payroll.preparedBy,
        });
      }
    }
    response.send("success");
  };

  static submitPayslipProof = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      if (!request.file) {
        response.status(400).json({ error: "No file uploaded" });
        return;
      }

      const account = request.account;

      const uploadResult = await cloudinary.uploader.upload(request.file.path, {
        folder: "nextjs_uploads",
        resource_type: "auto",
      });

      fs.unlinkSync(request.file.path);

      const url = uploadResult.secure_url;

      const { id, payrollId } = request.body;

      await PayrollService.addProof(id, payrollId, url);

      response.send("success");
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Upload failed" });
    }
  };

  static approvePayroll = async (request: AuthRequest, response: Response) => {
    const { id, approveBy } = request.body;
    const account = request.account;
    const aprovedPayroll = await PayrollService.approve(id, approveBy);
    for (const item of aprovedPayroll?.payroll!) {
      ExpencesService.create({
        date: getDate(),
        description: `Salary payment to ${item.name} `,
        account: account?._id!,
        cost: item.netPay,
        recordedBy: approveBy,
      });
    }
    response.send("success");
  };

  static rejectPayroll = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const account = request.account;
    await PayrollService.reject(id);
    response.send("success");
  };

  static getBussinessPayroll = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const payroll = await PayrollService.getByBusssiness(id);
    response.send(payroll);
  };

  static getPayslip = async (request: AuthRequest, response: Response) => {
    const { email, bussiness } = request.params;

    const account = await AccountService.getByEmail(email);

    const bussinessPayrols = await PayrollService.getByBusssiness(bussiness);

    const accountPayroll = bussinessPayrols.flatMap((payroll) =>
      payroll.payroll.filter(
        (item) => item.employeeId.toString() === account?._id.toString(),
      ),
    );

    response.send(accountPayroll.reverse());
  };

  static editSchedule = async (request: AuthRequest, response: Response) => {
    const { id, day, time, type, salary, salaryType, commision } = request.body;
    const account = request.account;
    switch (type) {
      case "artist":
        await ArtistInfoService.updateSched(id, day, time);
        break;

      case "bussiness_artist":
        await BussinessInfoService.updateArtistSched(
          account?._id!,
          id,
          day,
          time,
          salary,
          salaryType,
          commision,
        );
        break;

      case "bussiness_employee":
        await EmployeeInfoService.updateSched(
          id,
          day,
          time,
          salary,
          salaryType,
        );
        break;
    }
    response.send("success");
  };

  static addRole = async (request: AuthRequest, response: Response) => {
    const { permissions, role } = request.body;
    const account = request.account;
    await BussinessInfoService.pushRolesToBussiness(
      account?._id!,
      role,
      permissions,
    );
    response.send("success");
  };

  static artistApplyToBussiness = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const account = request.account;

    await ArtistApplicationService.create({
      artist: account?._id!,
      bussiness: id,
      date: getDate(),
      time: getTime(),
    });

    await NotificationService.create({
      account: id,
      date: getDate(),
      time: getTime(),
      message: `${account?.name} Apply as Artist to your Bussiness`,
      type: "success",
      isSeen: false,
    });

    response.send("success");
  };

  static getAllArtistVerification = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const artistVerifications = await ArtistVerificationServices.getAll();
    response.send(artistVerifications);
  };

  static artistVerification = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { verificationId, accountId, status, reason } = request.body;

    let alert;

    if (status == "approve") {
      await AccountService.updateAccountType(accountId, "artist");
      await ArtistInfoService.create({
        artist: accountId,
        bio: "none",
        schedTime: [
          "08:00",
          "09:00",
          "10:00",
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
        ],
        schedDay: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        profileImages: [],
        reviews: [],
      });
      await NotificationService.create({
        account: accountId,
        date: getDate(),
        time: getTime(),
        message: `Admin Approve you. your account is now Artist `,
        type: "danger",
        isSeen: false,
      });
      alert = "request Approved";
    } else {
      await NotificationService.create({
        account: accountId,
        date: getDate(),
        time: getTime(),
        message: `Admin Reject your Credentials. reason : ${reason}`,
        type: "danger",
        isSeen: false,
      });
      alert = "request Rejected";
    }

    await ArtistVerificationServices.delete(verificationId);

    const artistVerifications = await ArtistVerificationServices.getAll();
    response.send({ artistVerifications, alert });
  };

  static bussinessVerification = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { verificationId, accountId, status, reason } = request.body;

    let alert;

    if (status == "approve") {
      const verification = await ArtistVerificationServices.get(verificationId);
      await AccountService.updateAccountType(accountId, "bussiness");
      await AccountService.updateAccountName(
        accountId,
        verification?.bussinessName!,
      );
      await BussinessInfoService.create({
        bussiness: accountId,
        isLookingArtist: false,
        jobDescription: "none",
        artists: [],
        employees: [],
        bio: "none",
        config: {
          artistPayment: true,
          financeApproval: true,
          overTimePayment: true,
          artistToOtherBussiness: true,
          artistPost: true,
          artistBookAppointment: true,
        },
        profileImages: [],
        reviews: [],
        roles: [],
      });
      await DocumentService.create({
        bussiness: accountId,
        bussinessPermit: {
          url: verification?.bussinessPermit!,
          expiration: verification?.permitExpiration!,
        },
        BarangayClearance: null,
        MayorPermit: null,
        sanitaryPermit: null,
        HealthPermit: null,
        BIRRegistarion: null,
        DTIRegistarion: null,
        SECRegistarion: null,
      });
      await NotificationService.create({
        account: accountId,
        date: getDate(),
        time: getTime(),
        message: `Admin Approve you. your account is now Bussiness `,
        type: "danger",
        isSeen: false,
      });
      alert = "request Approved";
    } else {
      await NotificationService.create({
        account: accountId,
        date: getDate(),
        time: getTime(),
        message: `Admin Reject your Credentials. reason : ${reason}`,
        type: "danger",
        isSeen: false,
      });
      alert = "request Rejected";
    }
    await ArtistVerificationServices.delete(verificationId);

    const artistVerifications = await ArtistVerificationServices.getAll();
    response.send({ artistVerifications, alert });
  };

  static uploadProfileInfoImg = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      if (!request.file) {
        response.status(400).json({ error: "No file uploaded" });
        return;
      }

      const uploadResult = await cloudinary.uploader.upload(request.file.path, {
        folder: "nextjs_uploads",
        resource_type: "auto",
      });

      fs.unlinkSync(request.file.path);

      const url = uploadResult.secure_url;

      const fileType = uploadResult.resource_type;

      const { type } = request.body;

      const account = request.account;

      if (account?.type == "artist") {
        await ArtistInfoService.pushImg(account?._id!, url, type, fileType);
      } else {
        await BussinessInfoService.pushImg(account?._id!, url, type, fileType);
      }

      response.send("image uploaded");
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Upload failed" });
    }
  };

  static changePofilePicture = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      if (!request.file) {
        response.status(400).json({ error: "No file uploaded" });
        return;
      }

      const uploadResult = await cloudinary.uploader.upload(request.file.path, {
        folder: "nextjs_uploads",
        resource_type: "auto",
      });

      fs.unlinkSync(request.file.path);

      const url = uploadResult.secure_url;

      const account = request.account;

      const updatedAccount = await AccountService.updateProfilePic(
        account?._id!,
        url,
      );

      response.send(updatedAccount);
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Upload failed" });
    }
  };

  static placeReview = async (request: AuthRequest, response: Response) => {
    try {
      if (!request.file) {
        response.status(400).json({ error: "No file uploaded" });
        return;
      }

      const uploadResult = await cloudinary.uploader.upload(request.file.path, {
        folder: "nextjs_uploads",
        resource_type: "auto",
      });

      fs.unlinkSync(request.file.path);

      const url = uploadResult.secure_url;

      const { bookingId, rating, comment, artistId, bussinessId } =
        request.body;

      console.log(bussinessId);

      const account = request.account;

      await BookingService.markAsReviewed(bookingId);

      await NotificationService.create({
        account: artistId,
        date: getDate(),
        time: getTime(),
        message: `${account?.name} place ${rating} star review as feedback to your service`,
        type: rating >= 3 ? "success" : "danger",
        isSeen: false,
      });

      if (bussinessId != "none") {
        await BussinessInfoService.pushReviewToBussiness(
          bussinessId,
          url,
          comment,
          Number(rating),
          account?._id!,
        );
        await NotificationService.create({
          account: bussinessId,
          date: getDate(),
          time: getTime(),
          message: `${account?.name} place ${rating} star review as feedback to your service`,
          type: rating >= 3 ? "success" : "danger",
          isSeen: false,
        });
      }

      await ArtistInfoService.pushReviewToArtist(
        artistId,
        url,
        comment,
        Number(rating),
        account?._id!,
      );

      const bookings = await BookingService.getByClient(account?._id!);
      response.send(bookings);
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Upload failed" });
    }
  };

  static submitArtistVerification = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      if (!request.file) {
        response.status(400).json({ error: "No file uploaded" });
        return;
      }

      const account = request.account;

      const uploadResult = await cloudinary.uploader.upload(request.file.path, {
        folder: "nextjs_uploads",
        resource_type: "auto",
      });

      fs.unlinkSync(request.file.path);

      const url = uploadResult.secure_url;

      await ArtistVerificationServices.create({
        validId: url,
        client: account!._id,
        type: "artist",
        bussinessPermit: null,
        permitExpiration: "none",
        bussinessName: "none",
        barangayClearance: "none",
        clearanceExpiration: "none",
      });

      response.send("success");
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Upload failed" });
    }
  };

  static documentSubmit = async (request: AuthRequest, response: Response) => {
    try {
      if (!request.file) {
        response.status(400).json({ error: "No file uploaded" });
        return;
      }

      const account = request.account;

      const uploadResult = await cloudinary.uploader.upload(request.file.path, {
        folder: "nextjs_uploads",
        resource_type: "auto",
      });

      fs.unlinkSync(request.file.path);

      const url = uploadResult.secure_url;

      const { expirationDate, id, document } = request.body;

      await DocumentService.updateDocs(id, document, url, expirationDate);

      response.send("success");
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Upload failed" });
    }
  };

  static subsPayment = async (request: AuthRequest, response: Response) => {
    try {
      const { sender, receiver, days, amount, refId } = request.body;
      const account = request.account;

      const transaction = await TransactionService.checkIfRefIdExist(refId);
      if (!transaction) {
        const date = getDate();
        const time = getTime();

        const updatedAccount = await AccountService.addSubcriptionDays(
          sender,
          days,
        );

        await ExpencesService.create({
          account: account?._id!,
          date,
          description: "pay app subscription",
          cost: amount,
          recordedBy: account?.name!,
        });

        await TransactionService.create({
          sender,
          receiver,
          amount,
          time,
          date,
          refId,
        });

        response.send(updatedAccount);
      } else {
        response.status(500).send("error accour");
      }
    } catch (e) {
      console.log(e);
      response.status(500).send("error accour");
    }
  };

  static submitBussinessVerification = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const files = request.files as {
        BarangayClearance?: Express.Multer.File[];
        businessPermit?: Express.Multer.File[];
      };

      if (!files?.BarangayClearance || !files?.businessPermit) {
        response.status(400).json({ error: "Missing required files" });
        return;
      }

      const account = request.account;

      const BarangayClearanceUpload = await cloudinary.uploader.upload(
        files.BarangayClearance[0].path,
        { folder: "nextjs_uploads", resource_type: "auto" },
      );
      const businessPermitUpload = await cloudinary.uploader.upload(
        files.businessPermit[0].path,
        { folder: "nextjs_uploads", resource_type: "auto" },
      );

      const { bussinessName, expirationDate, clearanceExpiration } =
        request.body;

      // Delete local temp files
      fs.unlinkSync(files.BarangayClearance[0].path);
      fs.unlinkSync(files.businessPermit[0].path);

      await ArtistVerificationServices.create({
        validId: "none",
        bussinessPermit: businessPermitUpload.secure_url,
        client: account!._id,
        type: "bussiness",
        permitExpiration: expirationDate,
        bussinessName: bussinessName,
        barangayClearance: BarangayClearanceUpload.secure_url,
        clearanceExpiration: clearanceExpiration,
      });

      response.send("success");
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Upload failed" });
    }
  };

  static AiAutoFill = async (request: AuthRequest, response: Response) => {
    if (!request.file) {
      response.status(400).json({ error: "No file uploaded" });
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

    // Use the exact model name from the list
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let fileName = request.file.filename;
    const imagePath = path.resolve("uploads/" + fileName);
    const imageData = fs.readFileSync(imagePath).toString("base64");

    try {
      const prompt = `
                You are analyzing a tattoo image.

                TASK:
                1. Identify the tattoo art style (category) based ONLY on the visual art style.
                2. Determine the tattoo complexity based on the level of detail WITHIN its own art style.
                3. Determine whether the tattoo is colored or black-only.

                COMPLEXITY RULES (IMPORTANT):
                - Complexity is NOT determined by category alone.
                - Even if the category is Realism, Portrait, or Japanese, the complexity can still be 1, 2, or 3.
                - Judge complexity ONLY by visible detail, line work, shading, and visual effort.

                Complexity scale:
                1 = Very simple execution
                    Minimal detail, very basic shapes, little to no shading, clean lines only
                2 = Simple execution
                    Basic design with slight detail, minimal shading, limited elements 
                3 = Average execution
                    Moderate detail and shading, balanced composition, noticeable design effort
                4 = Complex execution
                    High level of detail, multiple elements, refined shading, texture present 
                5 = Very highly detailed execution
                    Extremely intricate, dense detail, advanced realism, heavy shading, complex textures 

                CATEGORY RULES:
                - Choose ONLY ONE category from this list:
                Traditional, Realism, Blackwork, Dotwork, Fine Line, Minimalist, Tribal, Japanese, Geometric, Illustrative, Portrait, Anime
                - Category must be based on art style, NOT on complexity.

                COLOR RULES:
                - isColored = true if any visible color other than black or gray is present.
                - isColored = false if the tattoo is only black or black & gray.

                OUTPUT RULES:
                - Do NOT explain your reasoning.
                - Do NOT include markdown.
                - Do NOT include extra text.

                RESPONSE FORMAT (STRICT JSON STRING ONLY):
                {
                "complexity": 1 | 2 | 3 | 4 | 5,
                "isColored": true | false,
                "category": "Traditional | Realism | Blackwork | Dotwork | Fine Line | Minimalist | Tribal | Japanese | Geometric | Illustrative | Portrait | Anime"
                }
            `;

      const imgChecker = await model.generateContent([
        {
          inlineData: {
            data: imageData,
            mimeType: "image/png",
          },
        },
        prompt,
      ]);

      let aiResponse = imgChecker.response.text();

      const parsedResponse = JSON.parse(aiResponse);
      console.log(parsedResponse);
      response.send(parsedResponse);
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Upload failed" });
    } finally {
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Failed to delete image:", err);
      });
    }
  };

  static submitAdminMessage = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      if (!request.file) {
        response.status(400).json({ error: "No file uploaded" });
        return;
      }

      const account = request.account;

      const uploadResult = await cloudinary.uploader.upload(request.file.path, {
        folder: "nextjs_uploads",
        resource_type: "auto",
      });

      fs.unlinkSync(request.file.path);

      const url = uploadResult.secure_url;

      const { message, reportedAccount } = request.body;

      await AdminMessageService.create({
        account: account?._id!,
        message: message,
        proof: url,
        type: "report",
        date: getDate(),
        time: getTime(),
        isSeen: false,
        reportedAccount: reportedAccount,
      });

      response.send("success");
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Upload failed" });
    }
  };
}
