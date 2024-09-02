import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

// middlewares
import config from "./config";
import errorMiddleware from "./middlewares/errorMiddleware";

// routes
import activity from "./routes/activity.route";
import admin from "./routes/admin.route";
import user from "./routes/user.route";

const app = express();

const options = {
  origin: "*",
  credentials: true,
};

app.use(cors(options));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

app.use(config.routePrefix + "/user", user);
app.use(config.routePrefix + "/activity", activity);
app.use(config.routePrefix + "/admin", admin);

app.use("*", (req, res) => {
  res.status(200).end("Api is available.");
});

app.use(errorMiddleware);

export default app;
