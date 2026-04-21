const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/", auth, upload.single('image'), postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/me", auth, postController.getUserPosts);
router.get("/:id", postController.getOnePost);
router.put("/:id", auth, postController.updatePost);
router.delete("/:id", auth, postController.deletePost);

// Interaction Routes
router.post("/:id/like", auth, postController.toggleLike);
router.get("/:id/like", auth, postController.checkLikeStatus);
router.post("/:id/comments", auth, postController.addComment);
router.get("/:id/comments", postController.getComments);

module.exports = router;
