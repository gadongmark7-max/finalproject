import nodemailer from "nodemailer"
import { transactionInterface } from "../types/transaction.type";
import dotenv from 'dotenv';

dotenv.config();


const MAIL_SENDER_EMAIL = process.env.MAIL_SENDER_EMAIL || "inkofbaphomet@gmail.com";
const MAIL_SENDER_NAME = process.env.MAIL_SENDER_NAME || "Ink Of Baphomet";

export const sendPin = async (email: string, pin: string) => {
  const apiKey = process.env.BREVO_API_KEY || "";

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: MAIL_SENDER_NAME,
          email: MAIL_SENDER_EMAIL,
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Verification Code",
        textContent: `Your verification PIN is ${pin}.`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; text-align:center;">
            <h2>Verification Code</h2>
            <p>Use the PIN below to continue:</p>

            <div style="
              font-size:28px;
              font-weight:bold;
              letter-spacing:6px;
              margin:20px 0;
              color:#2563eb;
            ">
              ${pin}
            </div>

            <p style="color:#666;font-size:12px;">
              If you didn't request this, ignore this email.
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("Brevo error:", data);
      return;
    }

    console.log("PIN email sent:", data);
  } catch (error) {
    console.log("Error sending PIN:", error);
  }
};




export const sendEmail = async (
  email : string, title : string,  message : string,
  replyTo? : { email : string, name? : string }
) : Promise<boolean> => {

  const apiKey =  process.env.BREVO_API_KEY || ""
  const senderEmail = MAIL_SENDER_EMAIL
  const senderName = MAIL_SENDER_NAME


  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail
        },
        // When set, a "Reply" in the recipient's inbox goes here instead of the
        // shared sender address. Existing callers omit this — behaviour unchanged.
        ...(replyTo?.email
          ? { replyTo: { email: replyTo.email, name: replyTo.name || replyTo.email } }
          : {}),
        to: [
          {
            email: email
          }
        ],
        subject: title,
        textContent: message,
htmlContent: `
  <div style="margin:0;padding:0;background-color:#080808;font-family:Arial,Helvetica,sans-serif;min-height:100vh;">
    <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;padding:60px 20px;">
      <tr>
        <td align="center" valign="middle">

          <!-- Outer glow wrapper -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">

                <!-- Card -->
                <table width="520" cellpadding="0" cellspacing="0"
                  style="
                    max-width:520px;
                    width:100%;
                    background:#1A1A1A;
                    border-radius:0;
                    overflow:hidden;
                    border:1px solid #242424;
                    box-shadow:0 20px 60px rgba(0,0,0,0.8);
                  ">

                  <!-- Top gold accent line -->
                  <tr>
                    <td style="background:#C9A84C;height:2px;font-size:0;line-height:0;">&nbsp;</td>
                  </tr>

                  <!-- Header -->
                  <tr>
                    <td style="background:#121212;padding:32px 40px 28px;text-align:center;border-bottom:1px solid #242424;">
                      <!-- Eyebrow line -->
                      <p style="margin:0 0 10px 0;font-size:10px;letter-spacing:6px;color:#C9A84C;text-transform:uppercase;">
                        ——&nbsp;&nbsp;Verified Communication&nbsp;&nbsp;——
                      </p>
                      <h1 style="margin:0;font-size:26px;letter-spacing:6px;color:#C9A84C;font-weight:300;text-transform:uppercase;">
                        Ink Of Baphomet
                      </h1>
                      <p style="margin:8px 0 0 0;font-size:11px;color:#7A7570;letter-spacing:3px;text-transform:uppercase;">
                        Discover &bull; Ink &bull; Express
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:44px 48px;text-align:center;background:#1A1A1A;">

                      <!-- Icon placeholder bar -->
                      <div style="width:48px;height:2px;background:#C9A84C;margin:0 auto 28px;opacity:0.6;"></div>

                      <h2 style="margin:0 0 18px 0;color:#F2EDE4;font-size:22px;font-weight:300;letter-spacing:-0.3px;line-height:1.3;">
                        ${title}
                      </h2>

                      <p style="color:#7A7570;font-size:14px;line-height:1.8;margin:0 0 36px 0;">
                        ${message}
                      </p>

                      <!-- Divider -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="border-top:1px solid #242424;padding:0;font-size:0;">&nbsp;</td>
                        </tr>
                      </table>

                      <!-- Branding note -->
                      <p style="margin:24px 0 0 0;font-size:11px;color:#3D3A36;letter-spacing:1px;">
                        This message was sent by <span style="color:#C9A84C;">Ink Of Baphomet</span>
                      </p>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:22px 40px;text-align:center;font-size:11px;color:#3D3A36;border-top:1px solid #242424;background:#121212;letter-spacing:0.5px;line-height:1.8;">
                      If you did not request this email, you can safely ignore it.<br/><br/>
                      &copy; ${new Date().getFullYear()} Ink Of Baphomet. All rights reserved.
                    </td>
                  </tr>

                  <!-- Bottom gold accent line -->
                  <tr>
                    <td style="background:#C9A84C;height:1px;font-size:0;line-height:0;opacity:0.4;">&nbsp;</td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </div>
`
      })
    });

    const data = await res.json();
    console.log("Email sent:", data);

    return res.ok;

  } catch (error) {
    console.log("Error:", error);
    return false;
  }
};

export const sendNewClientAccountEmail = (email : string, name : string, tempPassword : string) => {
  return sendEmail(
    email,
    "Your Ink Of Baphomet Account",
    `Hi ${name}, your artist has created an account for you so you can manage this booking online.<br/><br/>` +
    `Temporary password: <strong style="color:#C9A84C;">${tempPassword}</strong><br/><br/>` +
    `Please log in and change this password as soon as possible.`
  )
}

export const sendEmail_old = (email : string, title : string,  message : string) => {
        const transporter = nodemailer.createTransport({
                service: 'gmail', 
                auth: {
                user: 'inkofbaphomet@gmail.com',
                pass: 'sxib fmmt uxfz itkj',
                },
        });

    

      const mailOptions = {
        from: '"Tattoo App" <inkofbaphomet@gmail.com>',
        to: email,
        subject: title,
        text: message,
        html: `
        <div style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
                <td align="center">
                
                <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">
                    
                    <!-- Header -->
                    <tr>
                    <td style="background:#111827;padding:20px;text-align:center;">
                        <h1 style="color:#ffffff;margin:0;font-size:20px;letter-spacing:1px;">
                        Tattoo App
                        </h1>
                    </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                    <td style="padding:30px;text-align:center;">
                        <h2 style="margin:0 0 15px 0;color:#111827;">
                        ${title}
                        </h2>
                        
                        <p style="color:#4b5563;font-size:15px;line-height:1.6;margin-bottom:25px;">
                        ${message}
                        </p>

                

                    </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                    <td style="padding:20px;text-align:center;font-size:12px;color:#9ca3af;">
                        If you did not request this email, please ignore it.<br/>
                        © ${new Date().getFullYear()} Tattoo App. All rights reserved.
                    </td>
                    </tr>

                </table>

                </td>
            </tr>
            </table>
        </div>
        `
        };


      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Error:', error);
          } else {
            console.log('Email sent:', info.response);
          }
      });
      
}   

export const getTime = () => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    }); 
    return time 
}

export const getDate = () => {
    const now = new Date();
    const date = now.toLocaleDateString("en-US"); 
    return date 
}

export const getDuration = (timeIn: string, timeOut: string) => {
  if (!timeIn || !timeOut) return 0;

  const [inHour, inMin] = timeIn.split(":").map(Number);
  const [outHour, outMin] = timeOut.split(":").map(Number);

  const start = new Date();
  start.setHours(inHour, inMin, 0, 0);

  const end = new Date();
  end.setHours(outHour, outMin, 0, 0);

  const diffMs = end.getTime() - start.getTime();

  return diffMs / (1000 * 60 * 60); // hours
};


export const convertMDYtoYMD = (date : string) => {
  const [month, day, year] = date.split("/")
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}


const convertMonthToJS = (month: string): number => {
  return Number(month) - 1;
};



export const getThisMonthSales = ( selectedMonth : string ,transaction: transactionInterface[]) => {
  interface dailySalesInterface {
    date: string;
    sales: number;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = convertMonthToJS(selectedMonth)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dailySales: dailySalesInterface[] = [];

  // Create all days in local timezone
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    dailySales.push({ date, sales: 0 });
  }

  // Add actual sales
  transaction.forEach((item) => {
    const match = dailySales.find((d) => d.date === convertMDYtoYMD(item.date));
    if (match) match.sales += item.amount;
  });

  return dailySales;
};


export const getYearlySales = ( transactions : transactionInterface[]) => {
 
    const yearlySales = [
        { month : "01" , sales : 0},
        { month : "02" , sales : 0},
        { month : "03" , sales : 0},
        { month : "04" , sales : 0},
        { month : "05" , sales : 0},
        { month : "06" , sales : 0},
        { month : "07" , sales : 0},
        { month : "08" , sales : 0},
        { month : "09" , sales : 0},
        { month : "10" , sales : 0},
        { month : "11" , sales : 0},
        { month : "12" , sales : 0},
    ]

    transactions.forEach((transaction) => {
        const transactionDate = convertMDYtoYMD(transaction.date).split("-")
        const month = transactionDate[1] 
        yearlySales.forEach((item, index) => {
            if(item.month == month)
            {
                yearlySales[index].sales += transaction.amount
            }
        })
    })

    return yearlySales
}