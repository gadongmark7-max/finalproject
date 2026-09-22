import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { reportDataInterface } from "@/app/types/artist.type";

const peso = (v: number) =>
  `PHP ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function downloadArtistReportPdf(
  report: reportDataInterface,
  artistName: string,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 50;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(18);
  doc.text("Business Report", marginX, y);
  y += 22;

  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Artist: ${artistName}`, marginX, y);
  y += 14;
  doc.text(
    `Date range: ${report.range.from ?? "All time"} — ${report.range.to ?? "Present"}`,
    marginX,
    y,
  );
  y += 14;
  doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, y);
  y += 20;

  doc.setTextColor(20);
  doc.setFontSize(13);
  doc.text("Summary", marginX, y);
  y += 8;

  const s = report.summary;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    theme: "grid",
    headStyles: { fillColor: [201, 168, 76], textColor: [20, 20, 20] },
    styles: { fontSize: 9 },
    head: [["Metric", "Value"]],
    body: [
      ["Total Revenue", peso(s.totalRevenue)],
      ["Total Expenses", peso(s.totalExpenses)],
      ["Net Revenue", peso(s.netRevenue)],
      ["Total Transactions", String(s.totalTransactions)],
      ["Total Bookings", String(s.totalBookings)],
      ["Pending Bookings", String(s.pendingBookings)],
      ["Active Bookings", String(s.activeBookings)],
      ["Completed Bookings", String(s.completedBookings)],
      ["Rejected Bookings", String(s.rejectedBookings)],
      ["Total Clients", String(s.totalClients)],
      ["New Clients", String(s.newClients)],
      ["Returning Clients", String(s.returningClients)],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 24;

  doc.setFontSize(13);
  doc.text("Transactions", marginX, y);
  y += 8;

  if (report.transactions.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("No transactions in this date range.", marginX, y + 12);
    y += 24;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      headStyles: { fillColor: [201, 168, 76], textColor: [20, 20, 20] },
      styles: { fontSize: 8 },
      head: [["Date", "Client", "Method", "Ref ID", "Amount"]],
      body: report.transactions.map((t) => [
        t.date,
        t.client,
        t.paymentMethod,
        t.refId,
        peso(t.amount),
      ]),
    });
    y = (doc as any).lastAutoTable.finalY + 24;
  }

  if (y > 680) {
    doc.addPage();
    y = 50;
  }

  doc.setFontSize(13);
  doc.text("Bookings", marginX, y);
  y += 8;

  if (report.bookings.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("No bookings in this date range.", marginX, y + 12);
    y += 24;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      headStyles: { fillColor: [201, 168, 76], textColor: [20, 20, 20] },
      styles: { fontSize: 8 },
      head: [["Date", "Client", "Status", "Price", "Balance"]],
      body: report.bookings.map((b) => [
        b.date,
        b.client,
        b.status,
        peso(b.originalPrice),
        peso(b.balance),
      ]),
    });
    y = (doc as any).lastAutoTable.finalY + 24;
  }

  if (y > 680) {
    doc.addPage();
    y = 50;
  }

  doc.setFontSize(13);
  doc.text("Expenses", marginX, y);
  y += 8;

  if (report.expenses.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("No expenses in this date range.", marginX, y + 12);
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      headStyles: { fillColor: [201, 168, 76], textColor: [20, 20, 20] },
      styles: { fontSize: 8 },
      head: [["Date", "Category", "Description", "Amount"]],
      body: report.expenses.map((e) => [
        e.date,
        e.category,
        e.description,
        peso(e.cost),
      ]),
    });
  }

  const from = report.range.from ?? "all-time";
  const to = report.range.to ?? "present";
  doc.save(`artist-report_${from}_to_${to}.pdf`);
}

export function downloadArtistReportExcel(
  report: reportDataInterface,
  artistName: string,
) {
  const s = report.summary;
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["Business Report"],
    ["Artist", artistName],
    [
      "Date range",
      `${report.range.from ?? "All time"} to ${report.range.to ?? "Present"}`,
    ],
    ["Generated", new Date().toLocaleString()],
    [],
    ["Metric", "Value"],
    ["Total Revenue", s.totalRevenue],
    ["Total Expenses", s.totalExpenses],
    ["Net Revenue", s.netRevenue],
    ["Total Transactions", s.totalTransactions],
    ["Total Bookings", s.totalBookings],
    ["Pending Bookings", s.pendingBookings],
    ["Active Bookings", s.activeBookings],
    ["Completed Bookings", s.completedBookings],
    ["Rejected Bookings", s.rejectedBookings],
    ["Total Clients", s.totalClients],
    ["New Clients", s.newClients],
    ["Returning Clients", s.returningClients],
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  const transactionsSheet = XLSX.utils.json_to_sheet(
    report.transactions.map((t) => ({
      Date: t.date,
      Time: t.time,
      Client: t.client,
      Method: t.paymentMethod,
      "Reference ID": t.refId,
      Amount: t.amount,
    })),
  );
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions");

  const bookingsSheet = XLSX.utils.json_to_sheet(
    report.bookings.map((b) => ({
      Date: b.date,
      Client: b.client,
      Status: b.status,
      Price: b.originalPrice,
      Balance: b.balance,
    })),
  );
  XLSX.utils.book_append_sheet(workbook, bookingsSheet, "Bookings");

  const expensesSheet = XLSX.utils.json_to_sheet(
    report.expenses.map((e) => ({
      Date: e.date,
      Category: e.category,
      Description: e.description,
      Amount: e.cost,
      Notes: e.notes,
    })),
  );
  XLSX.utils.book_append_sheet(workbook, expensesSheet, "Expenses");

  const from = report.range.from ?? "all-time";
  const to = report.range.to ?? "present";
  XLSX.writeFile(workbook, `artist-report_${from}_to_${to}.xlsx`);
}
