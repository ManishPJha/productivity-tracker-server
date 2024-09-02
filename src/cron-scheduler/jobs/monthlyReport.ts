import { UserModel } from "../../db/model/users.model";
import sendEmail from "../../utils/sendEmail";

export default async function monthlyReport() {
  const users = await UserModel.find({ role: "user" });

  for (const user of users) {
    const emailStats = user.emailStats; // Array of dates (YYYY-MM-DD)
    const deductionAmount = 500; // Define your deduction amount
    const actualSalary = user.salary;
    let finalSalary = actualSalary;

    // Group dates by month
    const groupedByMonth: Record<string, string[]> = {}; // Key: "YYYY-MM", Value: Array of dates
    emailStats.forEach((dateString) => {
      const date = new Date(dateString);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`; // "YYYY-MM"
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = [];
      }
      groupedByMonth[monthKey].push(dateString);
    });

    let deductionDetails = "";
    Object.keys(groupedByMonth).forEach((monthKey) => {
      const datesList = groupedByMonth[monthKey].join(", "); // Join dates into a single string
      const count = groupedByMonth[monthKey].length;

      if (count > 3) {
        // Deduct if count exceeds 3
        finalSalary -= deductionAmount;
        deductionDetails += `\nDeduction for incomplete tracking in ${monthKey} (${count} times on dates: ${datesList}): -₹${deductionAmount}`;
      }
    });

    // Prepare email content
    const date = new Date().toLocaleDateString();

    const monthlyReportPayload = {
      user: {
        email: user.email,
        username: user.username,
      },
      actualSalary,
      deductionDetails,
      finalSalary,
      date,
    };

    await sendEmail(
      user.email,
      "Monthly Salary Statement",
      "monthly",
      monthlyReportPayload
    );
  }
}
