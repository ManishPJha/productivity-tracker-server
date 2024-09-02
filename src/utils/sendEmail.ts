import ejs from "ejs";
import fs from "fs";
import nodemailer, { SendMailOptions } from "nodemailer";
import path from "path";

// Define types
interface User {
  username: string;
  email: string;
}

interface DailyData {
  user: User;
  hoursTracked: number;
  minutesTracked: number;
  date: string;
  activityDetails: string;
  activityThreshold: number; // in milliseconds
}

interface MonthlyData {
  user: User;
  date: string;
  actualSalary: number;
  deductionDetails: string;
  finalSalary: number;
}

type EmailTemplate = "daily" | "monthly";

type EmailData =
  | { template: "daily"; data: DailyData }
  | { template: "monthly"; data: MonthlyData };

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_ADDRESS,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "4fdf6b774baebb",
    pass: "cab0ca6856bc7f",
  },
});

// Overloaded sendEmail function signatures
async function sendEmail(
  to: string,
  subject: string,
  template: "daily",
  data: DailyData
): Promise<void>;

async function sendEmail(
  to: string,
  subject: string,
  template: "monthly",
  data: MonthlyData
): Promise<void>;

// Implementation of the sendEmail function
async function sendEmail(
  to: string,
  subject: string,
  template: EmailTemplate,
  data: DailyData | MonthlyData
): Promise<void> {
  const mailOptions: SendMailOptions = {
    from: process.env.TEAM_EMAIL_ADDRESS,
    to,
    subject,
  };

  if (template) {
    const html = await renderEmail(template, data);
    mailOptions.html = html;
  } else {
    // Optionally handle plain text if no template is specified
    mailOptions.text = "No template provided.";
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Function to render email templates using EJS
const renderEmail = async (
  template: EmailTemplate,
  data: DailyData | MonthlyData
): Promise<string> => {
  const templatePath = path.join(
    __dirname,
    "../template",
    template === "daily" ? "daily-report.ejs" : "monthly-report.ejs"
  );
  const templateContent = await fs.promises.readFile(templatePath, "utf8");
  const html = ejs.render(templateContent, data);
  return html;
};

export default sendEmail;
