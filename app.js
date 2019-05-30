process.env.NODE_ENV = "test";

let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let cors = require("cors");
let logger = require("morgan");
let mongoose = require("mongoose");
let config = require("config");

let apiRouter = require("./routes/api");
let authRouter = require("./routes/auth");

let app = express();

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

app.use("/api", apiRouter);
app.use("/auth", authRouter);

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
  res.render("error");
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
