import cron from "node-cron";

import chalk from "chalk";
import config from "../config";

import dailyReports from "./jobs/dailyReport";
import monthlyReports from "./jobs/monthlyReport";

/**
 *
 * @param skipJobs skip scheduler jobs
 * @returns
 */
const cronJobScheduler = (skipJobs = false) => {
  const { dailyReport, monthlyReport } = config.cronJobs;

  if (skipJobs) {
    console.log(chalk.bgYellow.bold("Cron jobs scheduler skipped"));
    return;
  }

  // schedule daily report
  cron.schedule(dailyReport, dailyReports);

  // schedule monthly report
  cron.schedule(monthlyReport, monthlyReports);

  // schedule test report
  // cron.schedule(config.cronJobs.testReport, () => {
  //   console.log("Running test report job");
  //   dailyReports();
  //   monthlyReports();
  // });

  // schedule other cron jobs as needed
  //...

  console.log(chalk.bgCyan("Cron jobs scheduled"));
};

export default cronJobScheduler;
