import chalk from "chalk";
import { incrementEmailCount } from "../../controllers/admin.controller";
import { ActivityModel } from "../../db/model/activities.model";
import { UserModel } from "../../db/model/users.model";
import sendEmail from "../../utils/sendEmail";

export default async function dailyReports() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Get the day of the week (0: Sunday, 1: Monday, ..., 6: Saturday)

  // Skip running the job on Sunday
  if (dayOfWeek === 0) {
    console.log(
      chalk.bgYellow.bold("Skipping cron job because today is Sunday.")
    );
    return;
  }

  // Set the time threshold based on the day of the week
  const activityThreshold =
    dayOfWeek === 6 ? 4 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; // 4 hours on Saturday, 8 hours otherwise

  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)); // End of the day

  const users = await UserModel.find({ role: "user" });

  for (const user of users) {
    const activities = await ActivityModel.find({
      user: user._id,
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ timestamp: 1 });

    let totalTrackedTime = 0;
    let lastSnapshotTime: Date | null = null;
    let firstActivityTime: Date | null = null;
    let lastActivityTime: Date | null = null;

    const activityPeriods: { start: Date; end: Date }[] = [];

    activities.forEach((activity) => {
      if (!firstActivityTime) {
        firstActivityTime = activity.timestamp;
      }

      if (lastSnapshotTime) {
        const duration =
          activity.timestamp.getTime() - lastSnapshotTime.getTime();
        if (duration <= activityThreshold) {
          totalTrackedTime += duration / 1000; // Convert to seconds
          lastActivityTime = activity.timestamp;
        } else {
          // If the gap is more than the threshold, consider it a stop/start
          if (lastActivityTime) {
            activityPeriods.push({
              start: firstActivityTime!,
              end: lastActivityTime,
            });
          }
          firstActivityTime = activity.timestamp;
        }
      }
      lastSnapshotTime = activity.timestamp;
    });

    // Push the last period
    if (lastActivityTime) {
      activityPeriods.push({
        start: firstActivityTime!,
        end: lastActivityTime,
      });
    }

    // Convert totalTrackedTime from seconds to hours and minutes
    const hoursTracked = Math.floor(totalTrackedTime / 3600); // Convert seconds to hours (integer)
    const minutesTracked = Math.floor((totalTrackedTime % 3600) / 60); // Convert seconds to minutes

    if (hoursTracked < activityThreshold / (60 * 60 * 1000)) {
      // Check if tracked time is less than the threshold
      // Prepare email content
      const date = new Date().toLocaleDateString();
      let activityDetails = "";
      activityPeriods.forEach((period, index) => {
        const startTime = period.start.toLocaleTimeString();
        const endTime = period.end.toLocaleTimeString();
        activityDetails += `\nPeriod ${
          index + 1
        }:\nStarted at: ${startTime}\nStopped at: ${endTime}\n`;
      });

      const dailyReportPayload = {
        user: {
          email: user.email,
          username: user.username,
        },
        hoursTracked,
        minutesTracked,
        date,
        activityDetails,
        activityThreshold: activityThreshold / (60 * 60 * 1000),
      };

      await sendEmail(
        user.email,
        "Incomplete Tracking Time Alert",
        "daily",
        dailyReportPayload
      );

      // Increment email count
      await incrementEmailCount((user._id as unknown as any).toString());
    }
  }
}
