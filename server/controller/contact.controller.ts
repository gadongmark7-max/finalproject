import { Request, Response } from "express";
import { sendEmail } from "../utils/customFunction";

export class ContactController {
  static sendConsultation = async (request: Request, response: Response) => {
    try {
      const {
        name = "",
        email = "",
        phone = "",
        subject = "",
        message = "",
      } = (request.body ?? {}) as Record<string, string>;

      const cleanName = String(name).trim();
      const cleanEmail = String(email).trim();
      const cleanPhone = String(phone).trim();
      const cleanSubject = String(subject).trim();
      const cleanMessage = String(message).trim();

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (cleanName.length < 2) {
        response.status(400).send("Please enter your name.");
        return;
      }
      if (!emailPattern.test(cleanEmail)) {
        response.status(400).send("Please enter a valid email address.");
        return;
      }
      if (cleanMessage.length < 10) {
        response
          .status(400)
          .send("Please tell us a little more about what you're looking for.");
        return;
      }
      if (
        cleanMessage.length > 5000 ||
        cleanName.length > 120 ||
        cleanSubject.length > 200
      ) {
        response.status(400).send("One of the fields is too long.");
        return;
      }

      const contactInbox = process.env.CONTACT_EMAIL || "";
      if (!contactInbox) {
        console.log("CONTACT_EMAIL is not configured");
        response
          .status(500)
          .send("Contact form is not configured. Please try again later.");
        return;
      }

      const esc = (v: string) =>
        v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const rows: string[] = [
        `<strong>Name:</strong> ${esc(cleanName)}`,
        `<strong>Email:</strong> ${esc(cleanEmail)}`,
      ];
      if (cleanPhone) rows.push(`<strong>Phone:</strong> ${esc(cleanPhone)}`);
      if (cleanSubject)
        rows.push(`<strong>Style / Service:</strong> ${esc(cleanSubject)}`);
      rows.push(
        `<strong>Message:</strong><br/>${esc(cleanMessage).replace(/\n/g, "<br/>")}`,
      );

      const htmlMessage = `
        <p style="margin:0 0 16px 0;">New inquiry from the <strong>Book a Consultation</strong> form on the website.</p>
        <div style="text-align:left;line-height:1.9;font-size:14px;">
          ${rows.map((r) => `<p style="margin:0 0 8px 0;">${r}</p>`).join("")}
        </div>
      `;

      const subjectLine = `Book a Consultation — ${cleanName}${
        cleanSubject ? ` (${cleanSubject})` : ""
      }`;

      const ok = await sendEmail(contactInbox, subjectLine, htmlMessage, {
        email: cleanEmail,
        name: cleanName,
      });

      if (!ok) {
        response
          .status(502)
          .send(
            "We couldn't send your message right now. Please try again shortly.",
          );
        return;
      }

      response.status(200).send({ message: "sent" });
    } catch (e) {
      console.log(e);
      response.status(500).send("Something went wrong. Please try again.");
    }
  };
}
