import chalk from "chalk";
import http from "http";

import app from "./app";
import config from "./config";
import cronJobScheduler from "./cron-scheduler/scheduler";
import connetDatabase from "./db/connection";

const server = http.createServer(app);

connetDatabase();

process.on("uncaughtException", (error: Error) => {
  console.log("ERROR :" + error.stack);
  console.log("server is going to down due to uncaught promise exception.");
  process.exit(1);
});

server.listen(config.port, async () => {
  console.log(chalk.green.bold("server is running on port : "), config.port);
  cronJobScheduler(!config.isProduction); // run cron jobs only in production environment
});

process.on("unhandledRejection", (error: Error) => {
  console.log("ERROR :" + error.stack);
  server.close(() => {
    process.exit(1);
  });
  console.log(
    chalk.red.bold(
      "server is going to down due to unhandled promise rejection."
    )
  );
});

export default app;
