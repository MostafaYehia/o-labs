const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
const mongoose = require("mongoose");
const config = require("config");

const apiRouter = require("./routes/api");
const authRouter = require("./routes/auth");

const authController = require("./controllers/auth");

// Just for email testing purpose
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();

startDB();

if (config.util.getEnv("NODE_ENV") !== "test") {
  //use morgan to log at command line
  app.use(logger("dev"));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRouter);

app.use("/api", authController.isAuthenticated, apiRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
});

async function startDB() {
  const { host, port, dbName } = config.User.dbConfig;

  try {
    await mongoose.connect(`${host}:${port}/${dbName}`, {
      useNewUrlParser: true
    });
    console.log("Connected to mongodb successfully!");
  } catch (error) {
    console.log(error);
  }
}

module.exports = app;
