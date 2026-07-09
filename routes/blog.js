const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { requireAuth } = require("../middlewares/requireAuth");

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
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only image files (JPEG, PNG, GIF, WEBP) are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/add-new", requireAuth, (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/edit/:id", requireAuth, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.redirect("/");
  if (blog.createdBy.toString() !== req.user._id) {
    return res.redirect(`/blog/${req.params.id}`);
  }
  return res.render("addBlog", {
    user: req.user,
    blog,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );

  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/delete/:id", requireAuth, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.redirect("/");
  if (blog.createdBy.toString() !== req.user._id) {
    return res.redirect(`/blog/${req.params.id}`);
  }
  await Comment.deleteMany({ blogId: req.params.id });
  await Blog.findByIdAndDelete(req.params.id);
  return res.redirect("/");
});

router.post("/comment/:blogId", requireAuth, async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/edit/:id", requireAuth, (req, res, next) => {
  upload.single("coverImage")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError || err.message?.includes("image")) {
        return Blog.findById(req.params.id).then((blog) => {
          res.render("addBlog", {
            user: req.user,
            blog,
            error: err.message || "File upload error. Use JPEG, PNG, GIF, or WEBP under 5MB.",
          });
        });
      }
      return next(err);
    }
    next();
  });
}, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.redirect("/");
  if (blog.createdBy.toString() !== req.user._id) {
    return res.redirect(`/blog/${req.params.id}`);
  }
  const update = {
    title: req.body.title,
    body: req.body.body,
  };
  if (req.file) {
    update.coverImageURL = `/uploads/${req.file.filename}`;
  }
  await Blog.findByIdAndUpdate(req.params.id, update);
  return res.redirect(`/blog/${req.params.id}`);
});

router.post("/", requireAuth, (req, res, next) => {
  upload.single("coverImage")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError || err.message?.includes("image")) {
        return res.render("addBlog", {
          user: req.user,
          error: err.message || "File upload error. Use JPEG, PNG, GIF, or WEBP under 5MB.",
        });
      }
      return next(err);
    }
    next();
  });
}, async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: req.file ? `/uploads/${req.file.filename}` : undefined,
  });
  return res.redirect(`/blog/${blog._id}`);
});

module.exports = router;
