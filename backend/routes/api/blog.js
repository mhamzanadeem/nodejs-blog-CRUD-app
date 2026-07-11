const { Router } = require("express");
const Blog = require("../../models/blog");
const Comment = require("../../models/comment");
const { requireApiAuth } = require("../../middlewares/requireApiAuth");

const router = Router();

function mapBlog(blog, commentCount = 0) {
  return {
    _id: blog._id,
    title: blog.title,
    content: blog.body,
    coverImage: blog.coverImageURL,
    category: blog.category || "",
    excerpt: blog.excerpt || "",
    status: blog.status || "published",
    tags: blog.tags || [],
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    author: blog.createdBy
      ? {
          _id: blog.createdBy._id || blog.createdBy,
          fullName: blog.createdBy.fullName || "Unknown",
          avatar: blog.createdBy.profileImageURL && blog.createdBy.profileImageURL !== "/images/default.png"
            ? blog.createdBy.profileImageURL
            : null,
          bio: blog.createdBy.bio || "",
        }
      : null,
    commentCount,
  };
}

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const { category, search, status } = req.query;

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = "published";
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
      ];
    }

    const [blogs, total, commentCounts] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy"),
      Blog.countDocuments(query),
      Comment.aggregate([
        { $match: { blogId: { $ne: null } } },
        { $group: { _id: "$blogId", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = {};
    commentCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const mappedBlogs = blogs.map((b) =>
      mapBlog(b, countMap[b._id.toString()] || 0)
    );

    return res.json({
      blogs: mappedBlogs,
      total,
      pages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load blogs" });
  }
});

router.get("/mine", requireApiAuth, async (req, res) => {
  try {
    const blogs = await Blog.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate("createdBy");
    return res.json({ blogs: blogs.map((b) => mapBlog(b)) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load your blogs" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.json({ blog: mapBlog(blog) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load blog" });
  }
});

router.post("/", requireApiAuth, async (req, res) => {
  try {
    const { title, content, excerpt, category, status, tags } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const blog = await Blog.create({
      title: title.trim(),
      body: content,
      excerpt: excerpt || "",
      category: category || "",
      status: status || "published",
      tags: tags || [],
      createdBy: req.user._id,
    });

    const populated = await Blog.findById(blog._id).populate("createdBy");
    return res.status(201).json({ blog: mapBlog(populated), message: "Blog created" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create blog" });
  }
});

router.put("/:id", requireApiAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.createdBy.toString() !== req.user._id) {
      return res.status(403).json({ message: "Not authorized to edit this blog" });
    }

    const { title, content, excerpt, category, status, tags } = req.body;
    if (title) blog.title = title.trim();
    if (content) blog.body = content;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (category !== undefined) blog.category = category;
    if (status) blog.status = status;
    if (tags) blog.tags = tags;

    await blog.save();
    const populated = await Blog.findById(blog._id).populate("createdBy");
    return res.json({ blog: mapBlog(populated), message: "Blog updated" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update blog" });
  }
});

router.delete("/:id", requireApiAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.createdBy.toString() !== req.user._id) {
      return res.status(403).json({ message: "Not authorized to delete this blog" });
    }

    await Comment.deleteMany({ blogId: req.params.id });
    await Blog.findByIdAndDelete(req.params.id);
    return res.json({ message: "Blog deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete blog" });
  }
});

module.exports = router;