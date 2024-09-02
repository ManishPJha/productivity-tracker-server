import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

export default {
  port: process.env.PORT || 4000,
  apiUrl: process.env.API_URL || "http://localhost:3001",
  isProduction: process.env.NODE_ENV === "production",
  // databaseUrl: process.env.DATABASE_URL as string,
  databaseUrl:
    process.env.NODE_ENV === "production"
      ? (process.env.DATABASE_URL as string)
      : "mongodb://127.0.0.1:27017/olixlab-productivity-tracker",
  routePrefix: "/api",
  // cron jobs expressions
  cronJobs: {
    dailyReport: "0 0 * * *", // run every day at 12:00 AM
    monthlyReport: "0 0 5 * *", // run at 12:00 AM, on day 5 of the month
    testReport: "* * * * *", //run every minute
  },
};
