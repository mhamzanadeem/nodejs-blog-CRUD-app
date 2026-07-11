const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const apiUserRoute = require("./routes/api/user");
const apiBlogRoute = require("./routes/api/blog");
const apiCommentRoute = require("./routes/api/comment");

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["*"];

const wildcardAll = allowedOrigins.includes("*");

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (wildcardAll || allowedOrigins.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (wildcardAll) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

if (!process.env.MONGO_URL) {
  console.error("MONGO_URL environment variable is required");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URL, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
}).then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.use("/api/users/signin", authLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/users", apiUserRoute);
app.use("/api/blogs", apiBlogRoute);
app.use("/api", apiCommentRoute);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err.message || err);
  const status = err.status || 500;
  res.status(status).json({
    message: process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : err.message || "Something went wrong",
  });
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
