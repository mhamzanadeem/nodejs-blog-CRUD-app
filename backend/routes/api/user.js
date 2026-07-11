const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const User = require("../../models/user");
const Blog = require("../../models/blog");
const Comment = require("../../models/comment");
const { requireApiAuth } = require("../../middlewares/requireApiAuth");

const router = Router();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads/"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = crypto.randomUUID() + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only image files (JPEG, PNG, GIF, WEBP) are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

function mapUser(user) {
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    avatar: user.profileImageURL,
    role: user.role,
    bio: user.bio || "",
    createdAt: user.createdAt,
  };
}

router.post("/signup", upload.single("avatar"), async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ message: "Full name must be at least 2 characters" });
    }
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const userData = {
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      password,
    };
    if (req.body.bio) userData.bio = req.body.bio;
    if (req.file) {
      userData.profileImageURL = `/uploads/${req.file.filename}`;
    }

    const user = await User.create(userData);

    const token = await User.matchPasswordAndGenerateToken(email.toLowerCase(), password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ user: mapUser(user), message: "Account created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Sign up failed" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const token = await User.matchPasswordAndGenerateToken(email.toLowerCase(), password);
    const user = await User.findOne({ email: email.toLowerCase() });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user: mapUser(user), message: "Signed in successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }
});

router.post("/signout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Signed out successfully" });
});

router.get("/profile", requireApiAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user: mapUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load profile" });
  }
});

router.put("/profile", requireApiAuth, async (req, res) => {
  try {
    const { fullName, email, bio } = req.body;
    const update = {};
    if (fullName) update.fullName = fullName.trim();
    if (email) update.email = email.toLowerCase();
    if (bio !== undefined) update.bio = bio;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user: mapUser(user), message: "Profile updated" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

router.post("/avatar", requireApiAuth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImageURL: `/uploads/${req.file.filename}` },
      { new: true }
    );
    return res.json({ user: mapUser(user), message: "Avatar updated" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload avatar" });
  }
});

router.put("/password", requireApiAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { createHmac } = require("crypto");
    const hashedPassword = createHmac("sha256", user.salt)
      .update(currentPassword)
      .digest("hex");

    if (user.password !== hashedPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update password" });
  }
});

router.delete("/account", requireApiAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userBlogs = await Blog.find({ createdBy: userId });
    const blogIds = userBlogs.map((b) => b._id);
    await Comment.deleteMany({ blogId: { $in: blogIds } });
    await Comment.deleteMany({ createdBy: userId });
    await Blog.deleteMany({ createdBy: userId });
    await User.findByIdAndDelete(userId);
    res.clearCookie("token");
    return res.json({ message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;