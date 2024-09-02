import chalk from "chalk";
import { connect } from "mongoose";

import config from "../config/index";

const connetDatabase = async () => {
  try {
    await connect(config.databaseUrl);

    console.log(chalk.bgGreen("Connected to Database successfully."));
  } catch (error) {
    console.error(chalk.red.bold("Failed to connect to Database:"), error);
    process.exit(1);
  }
};

export default connetDatabase;
