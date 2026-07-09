require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

if (!process.env.MONGO_URL) {
  console.error("MONGO_URL environment variable is required");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.use("/user/signin", authLimiter);

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.use((req, res) => {
  res.status(404).render("signin", { error: "Page not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err.message || err);
  const status = err.status || 500;
  res.status(status).render("signin", {
    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message || "Something went wrong",
  });
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
