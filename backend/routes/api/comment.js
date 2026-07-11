const { Router } = require("express");
const Comment = require("../../models/comment");
const { requireApiAuth } = require("../../middlewares/requireApiAuth");

const router = Router();

function mapComment(comment) {
  return {
    _id: comment._id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: comment.createdBy
      ? {
          _id: comment.createdBy._id || comment.createdBy,
          fullName: comment.createdBy.fullName || "Anonymous",
          avatar: comment.createdBy.profileImageURL || "/images/default.png",
        }
      : null,
  };
}

router.get("/blogs/:blogId/comments", async (req, res) => {
  try {
    const allComments = await Comment.find({ blogId: req.params.blogId })
      .populate("createdBy")
      .sort({ createdAt: -1 });

    const topLevel = [];
    const replyMap = {};

    allComments.forEach((c) => {
      if (c.parentId) {
        const parentId = c.parentId.toString();
        if (!replyMap[parentId]) replyMap[parentId] = [];
        replyMap[parentId].push(mapComment(c));
      } else {
        topLevel.push(c);
      }
    });

    const comments = topLevel.map((c) => ({
      ...mapComment(c),
      replies: replyMap[c._id.toString()] || [],
    }));

    return res.json({ comments });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load comments" });
  }
});

router.post("/blogs/:blogId/comments", requireApiAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await Comment.create({
      content: content.trim(),
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });

    const populated = await Comment.findById(comment._id).populate("createdBy");
    return res.status(201).json({ comment: mapComment(populated) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add comment" });
  }
});

router.post("/blogs/:blogId/comments/:commentId/reply", requireApiAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const parent = await Comment.findById(req.params.commentId);
    if (!parent) return res.status(404).json({ message: "Comment not found" });

    const reply = await Comment.create({
      content: content.trim(),
      blogId: req.params.blogId,
      createdBy: req.user._id,
      parentId: req.params.commentId,
    });

    const populated = await Comment.findById(reply._id).populate("createdBy");
    return res.status(201).json({ reply: mapComment(populated) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add reply" });
  }
});

router.delete("/comments/:id", requireApiAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.createdBy.toString() !== req.user._id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await Comment.deleteMany({ parentId: req.params.id });
    await Comment.findByIdAndDelete(req.params.id);
    return res.json({ message: "Comment deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete comment" });
  }
});

module.exports = router;