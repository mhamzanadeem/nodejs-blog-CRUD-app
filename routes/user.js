const { Router } = require("express");
const User = require("../models/user");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { requireAuth } = require("../middlewares/requireAuth");

const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(
      email.toLowerCase(),
      password
    );

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

router.post("/delete-account", requireAuth, async (req, res) => {
  const userId = req.user._id;
  const userBlogs = await Blog.find({ createdBy: userId });
  const blogIds = userBlogs.map((b) => b._id);
  await Comment.deleteMany({ blogId: { $in: blogIds } });
  await Comment.deleteMany({ createdBy: userId });
  await Blog.deleteMany({ createdBy: userId });
  await User.findByIdAndDelete(userId);
  res.clearCookie("token").redirect("/");
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || fullName.trim().length < 2) {
    return res.render("signup", { error: "Full name must be at least 2 characters" });
  }
  if (!email || !email.includes("@")) {
    return res.render("signup", { error: "Please provide a valid email address" });
  }
  if (!password || password.length < 8) {
    return res.render("signup", {
      error: "Password must be at least 8 characters",
    });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.render("signup", { error: "An account with this email already exists" });
  }

  await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase(),
    password,
  });
  return res.redirect("/user/signin");
});

module.exports = router;
